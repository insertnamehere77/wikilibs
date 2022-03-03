import { CSSProperties, useEffect, useState } from 'react';
import { faPause, faPlay, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './Buttons.css';
import { speak, pause, resume, clearQueue } from '../utils/speech';



interface ButtonProps {
    callback: Function;
    children: JSX.Element | string;
    disabled?: boolean;
    color?: 'Blue' | 'Purple' | 'Green';
    title?: string;
    className?: string;
    style?: CSSProperties
}

function Button(props: ButtonProps): JSX.Element {
    const color = props.color || 'Blue';
    return (<button
        style={props.style}
        title={props.title}
        className={`Button ${color} ${props.className || ''}`}
        disabled={props.disabled}
        onClick={() => props.callback()} >{props.children}</button>)
}

interface VoiceButtonProps {
    text?: string;
    style?: CSSProperties;
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
            style={props.style}
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
            style={props.style}
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
        style={props.style}
        title='Read'
        callback={() => {
            if (props.text) {
                speak(props.text)
                    .addEventListener('end', (event: SpeechSynthesisEvent) => setVoiceStatus(VoiceStatus.NOT_SPEAKING));
            }
            setVoiceStatus(VoiceStatus.SPEAKING);
        }}
        disabled={!props.text}
    >
        <FontAwesomeIcon icon={faVolumeHigh} />
    </Button>;

}

export { Button, VoiceButton };