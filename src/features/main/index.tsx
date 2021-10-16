import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {backspaced, keyPressed} from "./slice";
import {KeyCapture} from "./model";
import KeyDefs from "./component/key-defs";
import CaptureKey from "./component/capture-key";
import MainConfig from './config/index';
import {useCallback, useMemo} from "react";
import {Rail, Segment} from "semantic-ui-react";
import Scoreboard from "./component/scoreboard";
import {isKeyDefMatch} from "./assessment";

export default function MainPage() {

    const main = useAppSelector((state) => state.main);
    const dispatch = useAppDispatch();

    const onKeyCapture = (kc: KeyCapture) => {
        if (kc.char.toLowerCase() === 'backspace') { // TODO: toLowerCase() shouldn't be necessary. 'Backspace' instead
            dispatch(backspaced());
        } else {
            dispatch(keyPressed({keyCapture: kc}));
        }
    };

    const history = useMemo(() => {
        const historyLength = main.keyHistory.length;
        const start = Math.max(0, historyLength - 6);
        return main.keyHistory.slice(start)
    }, [main.keyHistory])

    const isCorrect = useCallback((index: number) => {
        const ke = history[index];
        return isKeyDefMatch(ke, ke.prompt);
    }, [main.keyHistory]);

    return (<div>
        <Rail position='left'>
            <MainConfig/>
        </Rail>
        <table className={'main-table'}>
            <tbody>
            <tr>
                <td align="right" width='1*'>
                    <KeyDefs keyDefs={history.map(ke => ke.prompt)}/>
                </td>
                <td align="left" className="borders">
                    <KeyDefs keyDefs={main.keyPrompt}/>
                </td>
            </tr>
            <tr>
                <td align="right" width='1*'>
                    <KeyDefs keyDefs={history} isCorrectFn={isCorrect}/>
                </td>
                <td>
                    <CaptureKey
                        onCapture={onKeyCapture}
                        value={main.buffer}
                        selectAll={main.config.errorHandlingMode === "Ignore"}/>
                </td>
            </tr>
            </tbody>
        </table>
        <Rail position='right'>
            <Segment>
                <Scoreboard/>
            </Segment>
        </Rail>
    </div>);
}