import { useEffect, useState } from 'react';
import { faPause, faPlay, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './Buttons.css';
import { speak, pause, resume, clearQueue } from '../speech';



interface ButtonProps {
    callback: Function;
    children: JSX.Element | string;
    disabled?: boolean;
    color?: 'Blue' | 'Purple' | 'Green';
    title?: string;
    className?: string;
}

function Button(props: ButtonProps): JSX.Element {
    const color = props.color || 'Blue';
    return (<button
        title={props.title}
        className={`Button ${color} ${props.className || ''}`}
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

export { Button, VoiceButton };