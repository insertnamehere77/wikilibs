import { useCallback, useState } from 'react';
import './App.css';
import { BLANK } from './constants';
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

  const [article, setArticle] = useState<WikiArticle>();
  const [wordLookup, setWordLookup] = useState<WordLookup>({});


  const setBlankValue = useCallback((value: string, index: number) =>
    setWordLookup(curr => {
      curr[index] = value;
      return curr;
    }), []);



  return (
    <div className="App">
      <button onClick={() =>
        fetchRandomArticle()
          .then(newArticle => setArticle(newArticle))
          .catch(err => console.log(err))
      } > test</button>


      {article && <button onClick={() =>
        speak(fillInBlanks(article?.words, wordLookup))
      } > play</button>}


      {article && (
        <>
          <br />
          <h1>{article.title}</h1>
          <br />
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
        </>)
      }

    </div >
  );
}

export default App;
