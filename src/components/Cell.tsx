import React, {useRef, useState} from "react";
import {CellModel} from "../models/CellModel";

export const Cell = (props: { cell: CellModel, onFocus: any, onFocusOut: any }) => {
    const [isInputVisible, setInputVisibility] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const input = useRef<HTMLInputElement>(null);

    const onFocus = ($event: any) => {
        setInputVisibility(true);
        setTimeout(() => {
            if (input && input.current) {
                input.current!.focus();
                props.onFocus({cell: props.cell, text: inputValue});
            }
        }, 0);
    };

    const onFocusOut = ($event: any) => {
        setInputVisibility(false);
        props.onFocusOut({cell: props.cell, text: inputValue});
    };

    const onChange = ($event: any) => setInputValue($event.target.value);

    return (
        <div onClick={onFocus} onBlur={onFocusOut} style={{width: '100px', height: '45px'}}>
            {isInputVisible ? <input className="form-control cell" ref={input} tabIndex={props.cell.id}
                                     onChange={onChange}
                                     value={inputValue}/> : props.cell.text}
        </div>
    )
};
