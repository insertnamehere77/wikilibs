import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faCircleNotch, faX } from '@fortawesome/free-solid-svg-icons';

import './Article.css';
import { BLANK } from '../constants';
import LoadingState from '../enums/LoadingState';
import WikiArticle from '../types/WikiArticle';
import { fetchRandomArticle } from '../wiki';
import { Button, VoiceButton } from '../buttons';

interface WordProps {
    index: number;
    setBlankValue: Function;
    value: string;
}

const placeholders = ['adjective', 'verb', 'noun'];
function getElementCircular<Type>(arr: Array<Type>, index: number): Type {
    const size = arr.length;
    return arr[(index % size + size) % size];
}

function WordBlank(props: WordProps): JSX.Element {

    return <input type="text"
        className='Blank'
        value={props.value}
        placeholder={getElementCircular(placeholders, props.index)}
        onChange={(event) => props.setBlankValue(event.target.value, props.index)}
    />;
}




interface WordLookup {
    [index: number]: string;
}

const fillInBlanks = (words: string[], wordLookup: WordLookup): string =>
    words.map((word: string, index: number) =>
        word === BLANK ? wordLookup[index] : word)
        .join(' ');


function Article(): JSX.Element {
    const [loadingState, setLoadingState] = useState<LoadingState>();
    const [article, setArticle] = useState<WikiArticle>();
    const [wordLookup, setWordLookup] = useState<WordLookup>({});
    const voiceDisabled = Object.values(wordLookup).length !== article?.numBlanks;

    const setBlankValue = useCallback((value: string, index: number) =>
        setWordLookup(curr => ({ ...curr, [index]: value })), []);


    const fetchArticleAndResetState = useCallback(() => {
        setWordLookup({});
        setArticle(undefined);
        setLoadingState(LoadingState.LOADING);

        fetchRandomArticle()
            .then(newArticle => {
                setLoadingState(LoadingState.SUCCESS);
                setArticle(newArticle);
                document.title = `${newArticle.title} - Wikilibs`
            })
            .catch(err => {
                setLoadingState(LoadingState.FAILURE);
                console.error(err);
            })
    }, []);


    useEffect(() => {
        fetchArticleAndResetState();
    }, []);

    return (
        <div className="Article">
            {loadingState === LoadingState.LOADING &&
                <div className='LoadingStatusContainer'>
                    <div className='LoadingIndicator'>
                        <FontAwesomeIcon
                            size='3x'
                            icon={faCircleNotch} />
                    </div>
                </div>}
            {loadingState === LoadingState.FAILURE &&
                <div className='LoadingStatusContainer'>
                    <FontAwesomeIcon
                        size='3x'
                        icon={faX} />
                    <div>There was an issue loading the article!</div>
                </div>}
            {article && (
                <>
                    <h1 className='ArticleHeader'>{article.title}</h1>
                    <div className='ArticleSubHeader'>From Wikilibs, the silly encyclopedia</div>
                    <br />
                    <div className='ArticleContent'>
                        <div>
                            <div className='ArticleText'>
                                {article.words.map((wordStr, index) =>
                                    (wordStr === BLANK) ?
                                        <WordBlank
                                            key={`${wordStr}-${index}`}
                                            setBlankValue={setBlankValue}
                                            index={index}
                                            value={wordLookup[index] || ''} />
                                        :
                                        <div key={`${wordStr}-${index}`} >
                                            {wordStr}
                                        </div>
                                )}
                            </div>
                            <br />
                            <div className='ArticleControls'>
                                <Button callback={fetchArticleAndResetState} title="Random Page">
                                    <FontAwesomeIcon icon={faDice} />
                                </Button>
                                <VoiceButton text={voiceDisabled ?
                                    undefined :
                                    fillInBlanks(article?.words, wordLookup)} />
                            </div>
                        </div>
                        {article.imageSource && <div className='ArticleImage'>
                            <div className='ArticleImageHeader'>{article.title}</div>
                            <img src={article.imageSource} alt={article.title} />
                        </div>}
                    </div>
                </>)
            }
        </div >
    );
}

export default Article;
