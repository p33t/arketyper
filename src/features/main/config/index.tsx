import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import React, {ChangeEventHandler, FormEvent, useCallback} from "react";
import {AppConfig, ERROR_HANDLING_MODES, ErrorHandlingMode} from "../model";
import {configChanged} from "../slice";
import {KEY_SET_NAMES, KeySetName} from "../../../common/key-model";
import {PERFECT} from "../assessment";
import {CheckboxProps, DropdownItemProps, Form, Popup, Radio, RadioProps} from "semantic-ui-react";

export default function MainConfigComponent() {
    const config = useAppSelector((state) => state.main.config);
    const dispatch = useAppDispatch();

    const onKeySetChange = useCallback((evt: React.SyntheticEvent<HTMLElement, Event>) => {
        const keySetName = (evt.target as any).textContent as KeySetName;
        const newConfig = {
            ...config,
            keySetName,
        } as AppConfig;
        dispatch(configChanged(newConfig));
        evt.preventDefault();
    }, [config]);

    const keySetNameOptions = KEY_SET_NAMES.map(name => {
            return {
                key: name,
                text: name,
                value: name,
            } as DropdownItemProps
        }
    );

    const onToggle = useCallback((evt: FormEvent<HTMLInputElement>, checkBoxProps: CheckboxProps) => {
        const propName = checkBoxProps.value as keyof AppConfig;
        const newConfig = {
            ...config,
            [propName]: config[propName] === false,
        } as AppConfig;
        dispatch(configChanged(newConfig));
        evt.preventDefault();
    }, [config]);

    const onToggleErrorMode = useCallback((evt: FormEvent<HTMLInputElement>, radioProps: RadioProps) => {
        const newConfig = {
            ...config,
            errorHandlingMode: radioProps.value as ErrorHandlingMode,
        } as AppConfig;
        dispatch(configChanged(newConfig));
        evt.preventDefault();
    }, [config]);

    const onDifficultyChange: ChangeEventHandler<HTMLInputElement> = useCallback((evt) => {
        const newConfig = {
            ...config,
            difficultyTarget: Number(evt.target.value),
        } as AppConfig;
        dispatch(configChanged(newConfig));
        evt.preventDefault();
    }, [config]);

    const difficultySlider = <input type='range'
                                    style={{width: '100%'}}
                                    value={config.difficultyTarget}
                                    min='0'
                                    max={PERFECT.toString()}
                                    onChange={onDifficultyChange}/>;

    return (<div style={{textAlign: "left"}}>
            <Form>
                <Form.Select
                    label='Key Set:'
                    inline
                    value={config.keySetName}
                    onChange={onKeySetChange}
                    options={keySetNameOptions}/>
                <Form.Group inline>
                    <label>Modifiers:</label>
                    <Radio
                        inline='true'
                        value='shiftEnabled'
                        label='Shift'
                        toggle
                        checked={config.shiftEnabled}
                        onChange={onToggle}
                    />
                    &nbsp;&nbsp;&nbsp;
                    <Radio
                        inline='true'
                        value='altEnabled'
                        label='Alt'
                        toggle
                        checked={config.altEnabled}
                        onChange={onToggle}
                    />
                    {/* NOTE: Control modifier is too dangerous ATM.  Ctrl-Q closes browser, Ctrl-N opens new window etc. */}
                </Form.Group>

                <Form.Group>
                    <label>Errors:&nbsp;</label>
                    {ERROR_HANDLING_MODES.map((mode, index) => {
                        return (<span key={mode}>
                            {index > 0 && <>&nbsp;&nbsp;&nbsp;</>}
                            <Radio
                                label={mode}
                                value={mode}
                                checked={config.errorHandlingMode === mode}
                                onChange={onToggleErrorMode}
                            />
                        </span>);
                    })}
                </Form.Group>

                <Form.Group inline>
                    <label>Target Difficulty:</label>
                    <Form.Radio
                        inline
                        value='difficultyAutoAdjust'
                        label='Auto'
                        toggle
                        checked={config.difficultyAutoAdjust}
                        onChange={onToggle}
                    />
                </Form.Group>
                <Popup content={config.difficultyTarget.toString()}
                       position='right center'
                       trigger={difficultySlider}/>
            </Form>
        </div>
    );
}