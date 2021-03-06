import {KeyCapture} from "../model";
import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {Timestamper} from "../../../common/timing";
import {defaultRawCharFor, defaultShiftCharFor} from "../../../common/key-key";

interface CaptureKeyProps {
    value: KeyCapture[],

    onCapture(keyCapture: KeyCapture): void,

    selectAll: boolean,
}

export default function CaptureKeyComponent(props: CaptureKeyProps) {
    const timestamper = Timestamper;

    const defaultValue = useMemo(() => {
        return props.value.map((kc) => {
            let char = kc.char;
            if (kc.shift) {
                // FUTURE: Will allow user to customize for non-US keyboards
                char = defaultShiftCharFor(char);
            }
            return char;
        })
            .join('')
    }, [props.value]);

    const onKeyDown = useCallback((evt: KeyboardEvent) => {
        const normKey = evt.key.trim().toLowerCase();

        if (normKey === 'backspace' || normKey.length === 1) {
            evt.preventDefault();
            const char = evt.shiftKey ? defaultRawCharFor(evt.key) : evt.key;
            props.onCapture(
                {
                    char,
                    alt: evt.altKey,
                    control: evt.ctrlKey,
                    shift: evt.shiftKey,
                    keyedAt: timestamper(),
                },
            );
        }
    }, []);

    // Use low-level event handler setup to get at listening options
    const inputRef = useRef<HTMLInputElement>();
    useEffect(() => {
        // NOTE: Need passive:false to make evt.preventDefault() work in Chrome
        //       See https://youtu.be/DJYpXxWqvmo?t=152
        inputRef.current?.addEventListener('keydown', onKeyDown, {passive: false});
        // "capture: true" seems to double up the keystrokes and doesn't help with system shortcut capturing
        return () => {
            inputRef.current?.removeEventListener('keydown', onKeyDown)
        }
    }, [inputRef])

    useEffect(() => {
        if (props.selectAll) inputRef.current?.select();
    }, [inputRef, props.value, props.selectAll])

    return (<input type='text' className='main-input'
                            ref={(ref) => inputRef.current = ref ?? undefined}
                            defaultValue={defaultValue}/>
    );
}