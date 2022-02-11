import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { BLANK } from './constants';
import LoadingState from './enums/LoadingState';
import { speak } from './speech';
import WikiArticle from './types/WikiArticle';
import { fetchRandomArticle } from './wiki';


interface WordProps {
  index: number;
  setBlankValue: Function;
  value: string;
}

function WordBlank(props: WordProps): JSX.Element {

  return <input type="text"
    value={props.value}
    onChange={(event) => props.setBlankValue(event.target.value, props.index)}
  />;
}


function isBlank(text: string) {
  return text === BLANK;
}


interface WordLookup {
  [index: number]: string;
}

const fillInBlanks = (words: string[], wordLookup: WordLookup): string =>
  words.map((word: string, index: number) =>
    isBlank(word) ? wordLookup[index] : word)
    .join(' ');


function App() {
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
      <button onClick={() => fetchArticleAndResetState()
      } > Refresh</button>

      {loadingState === LoadingState.LOADING && <div>Loading...</div>}
      {loadingState === LoadingState.FAILURE && <div>Failed to load article!</div>}


      {article && <button onClick={() =>
        speak(fillInBlanks(article?.words, wordLookup))
      } > Play</button>}


      {article && (
        <>
          <br />
          <h1 className='ArticleHeader'>{article.title}</h1>
          <div className='ArticleSubHeader'>From Wikipedia, the free encyclopedia</div>
          <br />
          <div className='ArticleContent'>
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
            {article.imageSource && <div className='ArticleImage'>
              <img src={article.imageSource} alt='' />
            </div>}
          </div>
        </>)
      }

    </div >
  );
}

export default App;
