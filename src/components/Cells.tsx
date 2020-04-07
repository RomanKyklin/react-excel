import React, {useEffect, useState} from "react";
import {CellModel} from "../models/CellModel";
import {Cell} from "./Cell";
import {CellEvent} from "../models/CellEvent";

export const Cells = () => {
    const TABLE_WIDTH = 100;
    const TABLE_HEIGHT = 1000;
    const [headerCells, setHeaderCells] = useState<string[]>([]);
    const [rows, setRows] = useState<number[]>([]);
    const [cells, setCells] = useState<CellModel[][]>([]);
    const recursiveCellErrorText = 'error';

    const getHeaderCells = (width: number): string[] => {
        return columnNames(width);
    };

    const getRows = (height: number): number[] => {
        const result: number[] = [];
        for (let i = 0; i < height; i++) {
            result.push(i);
        }
        return result;
    };

    const getCells = (rows: number[], headerCells: string[]): CellModel[][] => {
        const result: CellModel[][] = [];
        rows.forEach((row, i) => {
            let cellsArray: CellModel[] = [];
            headerCells.forEach((header, j) => {
                cellsArray.push({x: headerCells[j], y: i, text: '', id: Math.random()} as CellModel);
            });
            result.push(cellsArray);
            cellsArray = [];
        });
        return result;
    };

    const columnNames = (n: number): string[] => {
        const result = [];

        const indexA = 'A'.charCodeAt(0);
        const indexZ = 'Z'.charCodeAt(0);

        let alphabetLength = indexZ - indexA + 1;
        const repeatNum = Math.floor(n / alphabetLength);

        let startIndex = 0;
        let startString = '';
        let str = '';

        while (startIndex <= repeatNum) {
            if (startIndex > 0) {
                startString = String.fromCharCode(indexA + startIndex - 1);
            }

            if (startIndex === repeatNum) {
                alphabetLength = n % alphabetLength;
            }

            for (let i = 0; i < alphabetLength; i++) {
                str = String.fromCharCode(indexA + i);

                result.push(startString + str);
            }
            startIndex++;
        }
        return result;
    };

    useEffect(() => {
        const headerCells = getHeaderCells(TABLE_WIDTH);
        const rows = getRows(TABLE_HEIGHT);
        setHeaderCells(headerCells);
        setRows(rows);
        setCells(getCells(rows, headerCells))
    }, []);

    const parseCellText = (cell: CellModel, text: string): number | string => {
        if (isCellsOperation(text)) {
            return isCellRecursive(cell, text)
                ? recursiveCellErrorText : parsePlusSeparatedExpression(parseCells(text));
        } else if (isNumericOperation(text)) {
            return parsePlusSeparatedExpression(text);
        }
        return text;
    };

    const isCellRecursive = (cell: CellModel, text: string): boolean => {
        return text.toLowerCase().search(`${cell.x}${cell.y}`.toLowerCase()) !== -1;
    };

    const parseCells = (text: string): string => {
        let result = text;
        const cellsKeys: any[] = text.match(/[(a-zA-Z)(0-9)]+/gm) as any[];
        cellsKeys.forEach(cellKey => {
            cells.forEach((cellArr: CellModel[]) => {
                const foundCell = cellArr.find(val => {
                    const actualCellKey = `${val.x}${val.y}`;
                    return cellKey.toLowerCase() === actualCellKey.toLowerCase();
                });
                if (foundCell) {
                    result = result.replace(cellKey, foundCell.text);
                }
            });
        });
        return result;
    };

    const parsePlusSeparatedExpression = (expression: string): number => {
        const numbersString = split(expression, '+');
        const numbers = numbersString.map(noStr => parseMinusSeparatedExpression(noStr));
        const initialValue = 0.0;
        return numbers.reduce((acc, no) => acc + no, initialValue);
    };

    const parseMultiplicationSeparatedExpression = (expression: string): number => {
        const numbersString = expression.split('*');
        const numbers = numbersString.map(noStr => parseDivisionSeparatedExpression(noStr));
        const initialValue = 1.0;
        return numbers.reduce((acc, no) => acc * no, initialValue);
    };

    const parseMinusSeparatedExpression = (expression: string): number => {
        const numbersString = expression.split('-');
        const numbers = numbersString.map(noStr => parseMultiplicationSeparatedExpression(noStr));
        const initialValue = numbers[0];
        return numbers.slice(1).reduce((acc, no) => acc - no, initialValue);
    };

    const parseDivisionSeparatedExpression = (expression: string): number => {
        const numbersString = expression.split('/');
        const numbers = numbersString.map(noStr => {
            if (noStr[0] === '(') {
                const expr = noStr.substr(1, noStr.length - 2);
                return parsePlusSeparatedExpression(expr);
            }
            return +noStr;
        });
        const initialValue = numbers[0];
        return numbers.slice(1).reduce((acc, no) => acc / no, initialValue);
    };

    const split = (expression: string, operator: string) => {
        const result = [];
        let braces = 0;
        let currentChunk = '';
        for (let i = 0; i < expression.length; ++i) {
            const curCh = expression[i];
            if (curCh === '(') {
                braces++;
            } else if (curCh === ')') {
                braces--;
            }
            if (braces === 0 && operator === curCh) {
                result.push(currentChunk);
                currentChunk = '';
            } else {
                currentChunk += curCh;
            }
        }
        if (currentChunk !== '') {
            result.push(currentChunk);
        }
        return result;
    };

    const isNumericOperation = (text: string): boolean => {
        return text[0] === '(' || isNumeric(text[0]);
    };

    const isCellsOperation = (text: string): boolean => {
        return text.search(/[(a-zA-Z)(0-9)]+/gm) !== -1;
    };

    const isNumeric = (num: any) => (typeof (num) === 'number' || typeof (num) === 'string' && num.trim() !== '') && !isNaN(num as number);

    const onFocus = ($event: CellEvent) => {
        const {cell} = $event;
        cell.text = cell.formula as string;
    };

    const onFocusOut = ($event: CellEvent) => {
        const {cell, text} = $event;
        if (text) {
            cell.formula = text;
            cell.text = parseCellText(cell, text) as string;
        }
    };

    return (
        <table className="table table-bordered">
            <thead>
            <tr>
                <th scope="col"></th>
                {headerCells.map((cell, index) => <th scope="col" key={index}>{cell}</th>)}
            </tr>
            </thead>
            <tbody>
            {rows.map((row, index) => {
                return (
                    <tr key={index}>
                        <th scope="row">{row}</th>
                        {cells[index].map((cell, index) =>
                            <td key={index} className='cell-container'>
                                <Cell cell={cell} onFocus={onFocus} onFocusOut={onFocusOut}/>
                            </td>)}
                    </tr>
                )
            })}
            </tbody>
        </table>
    )
};
