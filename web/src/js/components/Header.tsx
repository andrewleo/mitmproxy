import React, {useState} from 'react'
import classnames from 'classnames'
import StartMenu from './Header/StartMenu'
import OptionMenu from './Header/OptionMenu'
import FileMenu from './Header/FileMenu'
import FlowMenu from './Header/FlowMenu'
import ConnectionIndicator from "./Header/ConnectionIndicator"
import HideInStatic from './common/HideInStatic'
import { clearFlows } from "../ducks/flows"
import {useAppSelector,useAppDispatch} from "../ducks";

interface Menu {
    (): JSX.Element;

    title: string;
}

export default function Header() {
    const dispatch = useAppDispatch()
    const selectedFlows = useAppSelector(state => state.flows.selected.filter(id => id in state.flows.byId)),
        [ActiveMenu, setActiveMenu] = useState<Menu>(() => StartMenu),
        [wasFlowSelected, setWasFlowSelected] = useState(false);

    let entries: Menu[] = [StartMenu];
    if (selectedFlows.length > 0) {
        if (!wasFlowSelected) {
            setActiveMenu(() => FlowMenu);
            setWasFlowSelected(true);
        }
        entries.push(FlowMenu)
    } else {
        if (wasFlowSelected) {
            setWasFlowSelected(false);
        }
        if (ActiveMenu === FlowMenu) {
            setActiveMenu(() => StartMenu)
        }
    }

    function handleClick(active: Menu, e) {
        e.preventDefault()
        setActiveMenu(() => active)
    }

    return (
        <header>
            <nav className="nav-tabs nav-tabs-lg">
                {/*<FileMenu/>*/}
                {/*{entries.map(Entry => (*/}
                {/*    <a key={Entry.title}*/}
                {/*       href="#"*/}
                {/*       className={classnames({active: Entry === ActiveMenu})}*/}
                {/*       onClick={e => handleClick(Entry, e)}>*/}
                {/*        {Entry.title}*/}
                {/*    </a>*/}
                {/*))}*/}
                <HideInStatic>
                    <ConnectionIndicator/>
                    {/* <span className='nav-tabs-button' onClick={() => dispatch(clearFlows())}>Clear All <i className="fa fa-trash-o"></i></span> */}
                </HideInStatic>
            </nav>
            <div>
                <ActiveMenu/>
            </div>
        </header>
    )
}
