import { BLANK } from "../constants";

const wikipediaApiUrl = 'https://en.wikipedia.org/w/api.php';


function formatGetParams(params: object): string {
    const urlParams =
        Object.entries(params)
            .map(pair => `${pair[0]}=${pair[1]}`)
            .join('&');
    return `?${urlParams}`;
}

interface ThumbnailInfo {
    height: number;
    width: number;
    source: string;
}

interface RandomArticleInfo {
    pageid: number;
    ns: number;
    title: string;
    thumbnail?: ThumbnailInfo;
}


async function fetchRandomArticlesInfo(limit: number = 1): Promise<RandomArticleInfo[]> {
    const parameters = {
        action: 'query',
        origin: '*',
        format: 'json',
        //Parameters for the random article query
        generator: 'random',
        grnlimit: limit,
        grnnamespace: 0,  //Limit the random page selection to just articles
        //Parameters for the thumbnail info query
        prop: 'pageimages',
        piprop: 'thumbnail',
        pithumbsize: 300
    };

    const response = await fetch(wikipediaApiUrl + formatGetParams(parameters));
    const apiResult = await response.json();
    return Object.values(apiResult.query.pages);
}


async function fetchPageHTML(pageId: number): Promise<string> {
    const parameters = {
        action: 'parse',
        prop: 'text|images',
        section: 0,
        origin: '*',
        format: 'json',
        pageid: pageId
    };

    const response = await fetch(wikipediaApiUrl + formatGetParams(parameters));
    const apiResult = await response.json();
    return apiResult.parse.text['*'];
}


function parseWikiHtml(text: string): string[] {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const paragraphs =
        Array.from(doc.getElementsByClassName('mw-parser-output'))
            .flatMap(parserOutput => Array.from(parserOutput.getElementsByTagName('p')));

    //Here we swap out the innerText of the <a> so that we can tell where the links are in the cleaned text
    const links = paragraphs.flatMap(para => Array.from(para.getElementsByTagName('a')));
    links.forEach(link => link.innerText = ` ${BLANK} `);

    const paragraphsText =
        paragraphs
            .map(para => para.innerText)
            .join(' ');

    const words =
        paragraphsText
            .split(' ')
            .map(word => word.trim())
            .filter(word => word !== '');

    return words;
}


export interface WikiArticle {
    title: string;
    words: Array<string>;
    numBlanks: number;
    imageSource?: string;
}


async function fetchRandomArticle(): Promise<WikiArticle> {
    const randomArticle = (await fetchRandomArticlesInfo())[0];
    if (!randomArticle) {
        throw Error("Couldn't get a random article");
    }

    const html = await fetchPageHTML(randomArticle.pageid);
    if (!html) {
        throw Error(`Couldn't fetch HTML for article "${randomArticle.title}" with ID ${randomArticle.pageid}`);
    }
    const words = parseWikiHtml(html);
    const numBlanks = words.reduce((total, currWord) => total + (currWord === BLANK ? 1 : 0), 0);
    return {
        title: randomArticle.title,
        imageSource: randomArticle.thumbnail?.source,
        words: words,
        numBlanks: numBlanks
    };
}



export {
    fetchRandomArticle
}