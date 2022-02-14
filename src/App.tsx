import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { BLANK } from './constants';
import LoadingState from './enums/LoadingState';
import { speak, pause, resume, clearQueue } from './speech';
import WikiArticle from './types/WikiArticle';
import { fetchRandomArticle } from './wiki';


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

interface ButtonProps {
  callback: Function;
  text: string;
  disabled?: boolean;
}

function Button(props: ButtonProps): JSX.Element {
  return (<button disabled={props.disabled}
    onClick={() => props.callback()} >{props.text}</button>)
}

interface VoiceButtonProps {
  text?: string;
}

enum VoiceStatus {
  NOT_SPEAKING = "NOT_SPEAKING",
  PAUSED = "PAUSED",
  SPEAKING = "SPEAKING"
}

function VoiceButton(props: VoiceButtonProps): JSX.Element {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>(VoiceStatus.NOT_SPEAKING);

  useEffect(() => {
    function cleanup() {
      clearQueue();
      window.removeEventListener('beforeunload', cleanup);
    }
    window.addEventListener('beforeunload', cleanup);
    return cleanup;
  }, []);

  if (voiceStatus === VoiceStatus.SPEAKING) {
    return <Button text='Pause It!'
      callback={() => {
        pause();
        setVoiceStatus(VoiceStatus.PAUSED);
      }}
    />;
  }

  if (voiceStatus === VoiceStatus.PAUSED) {
    return <Button text='Resume It!'
      callback={() => {
        resume();
        setVoiceStatus(VoiceStatus.SPEAKING);
      }}
    />;
  }

  return <Button text='Read It!'
    callback={() => {
      props.text && speak(props.text);
      setVoiceStatus(VoiceStatus.SPEAKING);
    }}
    disabled={!props.text}
  />;

}

function isBlank(text: string): boolean {
  return text === BLANK;
}


interface WordLookup {
  [index: number]: string;
}

const fillInBlanks = (words: string[], wordLookup: WordLookup): string =>
  words.map((word: string, index: number) =>
    isBlank(word) ? wordLookup[index] : word)
    .join(' ');


function App(): JSX.Element {
  const [loadingState, setLoadingState] = useState<LoadingState>();
  const [article, setArticle] = useState<WikiArticle>();
  const [wordLookup, setWordLookup] = useState<WordLookup>({});


  const setBlankValue = useCallback((value: string, index: number) =>
    setWordLookup(curr => {
      curr[index] = value;
      return curr;
    }), []);


  const fetchArticleAndResetState = useCallback(() => {
    setWordLookup({});
    setArticle(undefined);
    setLoadingState(LoadingState.LOADING);

    fetchRandomArticle()
      .then(newArticle => {
        setLoadingState(LoadingState.SUCCESS);
        setArticle(newArticle);
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
    <div className="App">

      {loadingState === LoadingState.LOADING && <div>Loading...</div>}
      {loadingState === LoadingState.FAILURE && <div>Failed to load article!</div>}


      {article && (
        <>
          <h1 className='ArticleHeader'>{article.title}</h1>
          <div className='ArticleSubHeader'>From Wikipedia, the free encyclopedia</div>
          <br />
          <div className='ArticleContent'>
            <div>
              <div className='ArticleText'>
                {article.words.map((wordStr, index) =>
                  isBlank(wordStr) ?
                    <WordBlank
                      key={`${wordStr}-${index}`}
                      setBlankValue={setBlankValue}
                      index={index}
                      value={wordLookup[index]} />
                    :
                    <div key={`${wordStr}-${index}`} >
                      {wordStr}
                    </div>
                )}
              </div>
              <br />

              <div className='ArticleControls'>
                <Button callback={fetchArticleAndResetState} text='New Article!' />
                <VoiceButton text={fillInBlanks(article?.words, wordLookup)} />
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

export default App;
