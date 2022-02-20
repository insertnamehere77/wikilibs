import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { BLANK } from './constants';
import LoadingState from './enums/LoadingState';
import { speak, pause, resume, clearQueue } from './speech';
import WikiArticle from './types/WikiArticle';
import { fetchRandomArticle } from './wiki';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice, faPause, faPlay, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';


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
  children: JSX.Element | string;
  disabled?: boolean;
  color?: 'Blue' | 'Purple' | 'Green';
  title?: string;
}

function Button(props: ButtonProps): JSX.Element {
  const color = props.color || 'Blue';
  return (<button
    title={props.title}
    className={`Button ${color}`}
    disabled={props.disabled}
    onClick={() => props.callback()} >{props.children}</button>)
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
    return (<Button
      color='Purple'
      title='Pause'
      callback={() => {
        pause();
        setVoiceStatus(VoiceStatus.PAUSED);
      }}
    >
      <FontAwesomeIcon icon={faPause} />
    </Button>);
  }

  if (voiceStatus === VoiceStatus.PAUSED) {
    return <Button
      color='Green'
      title='Continue'
      callback={() => {
        resume();
        setVoiceStatus(VoiceStatus.SPEAKING);
      }}
    >
      <FontAwesomeIcon icon={faPlay} />
    </Button>;
  }

  return <Button
    title='Read'
    callback={() => {
      props.text && speak(props.text);
      setVoiceStatus(VoiceStatus.SPEAKING);
    }}
    disabled={!props.text}
  >
    <FontAwesomeIcon icon={faVolumeHigh} />
  </Button>;

}


interface WordLookup {
  [index: number]: string;
}

const fillInBlanks = (words: string[], wordLookup: WordLookup): string =>
  words.map((word: string, index: number) =>
    word === BLANK ? wordLookup[index] : word)
    .join(' ');


function App(): JSX.Element {
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
                  <>
                    <FontAwesomeIcon icon={faDice} />
                  </>
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

export default App;
