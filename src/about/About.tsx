import { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDice } from '@fortawesome/free-solid-svg-icons';

import "./About.css";
import { Button } from "../buttons";
import { RouterContext } from '../navbar';



function About() {
    const navigateToPath = useContext(RouterContext);
    return (
        <div className="About">
            <div className="WelcomeBanner">
                <div style={{ 'fontSize': '1.5em' }}>Welcome to Wikilibs,</div>
                <div style={{ 'fontSize': '1.15em' }}>the silly encyclopedia that anyone can edit</div>
            </div>
            <div className="AboutBody">
                Wikilibs is a web toy that makes fill-in-the-blank games out of Wikipedia articles. It's built using React and TypeScript and is powered by the MediaWiki API. I developed Wikilibs just to get some frontend practice outside of my day job.
            </div>
            <Button
                className='RandomButton'
                callback={() => navigateToPath('/random')}
                title="Random Page">
                <>
                    <FontAwesomeIcon icon={faDice} /> Random Article!
                </>
            </Button>
        </div>
    );
};

export default About;