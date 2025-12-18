import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import Filt from '../../filt/filt'
import FilterDocs from './FilterDocs'

type FilterInputProps = {
    type: string
    color: any
    placeholder: string
    value: string
    onChange: (value) => { type: string, filter?: string, highlight?: string } | void
}

type FilterInputState = {
    value: string
    focus: boolean
    mousefocus: boolean
}

export default class FilterInput extends Component<FilterInputProps, FilterInputState> {

    constructor(props, context) {
        super(props, context)

        // Consider both focus and mouseover for showing/hiding the tooltip,
        // because onBlur of the input is triggered before the click on the tooltip
        // finalized, hiding the tooltip just as the user clicks on it.
        this.state = {value: this.props.value, focus: false, mousefocus: false}

        this.onChange = this.onChange.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.onMouseEnter = this.onMouseEnter.bind(this)
        this.onMouseLeave = this.onMouseLeave.bind(this)
        this.selectFilter = this.selectFilter.bind(this)
        this.onClear = this.onClear.bind(this)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value && !this.state.focus) {
            this.setState({value: nextProps.value})
        }
    }

    isValid(filt) {
        try {
            if (filt) {
                Filt.parse(filt)
            }
            return true
        } catch (e) {
            return false
        }
    }

    getDesc() {
        if (!this.state.value) {
            return <FilterDocs selectHandler={this.selectFilter}/>
        }
        try {
            return Filt.parse(this.state.value).desc
        } catch (e) {
            return '' + e
        }
    }

    onChange(e) {
        const value = e.target.value
        this.setState({value})

        // Only propagate valid filters upwards.
        if (this.isValid(value)) {
            this.props.onChange(value)
        }
    }

    onFocus() {
        this.setState({focus: true})
    }

    onBlur() {
        this.setState({focus: false})
    }

    onMouseEnter() {
        this.setState({mousefocus: true})
    }

    onMouseLeave() {
        this.setState({mousefocus: false})
    }

    onKeyDown(e) {
        if (e.key === "Escape" || e.key === "Enter") {
            this.blur()
            // If closed using ESC/ENTER, hide the tooltip.
            this.setState({mousefocus: false})
        }
        e.stopPropagation()
    }

    selectFilter(cmd) {
        this.setState({value: cmd})
        ReactDOM.findDOMNode(this.refs.input).focus()
    }

    blur() {
        ReactDOM.findDOMNode(this.refs.input).blur()
    }

    select() {
        ReactDOM.findDOMNode(this.refs.input).select()
    }

    onClear() {
        this.setState({value: ''})
        this.props.onChange('')
        ReactDOM.findDOMNode(this.refs.input).focus()
    }

    render() {
        const {type, color, placeholder} = this.props
        const {value, focus, mousefocus} = this.state
        return (
            <div className={classnames('filter-input input-group', {'has-error': !this.isValid(value)})}>
                <span className="input-group-addon">
                    <i className={'fa fa-fw fa-' + type} style={{color}}/>
                </span>
                <input
                    type="text"
                    ref="input"
                    placeholder="~h xxx：filter string within request header/body and response header/body."
                    className="form-control input-filter-third"
                    value={value}
                    onChange={this.onChange}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onKeyDown={this.onKeyDown}
                />
                {value && (
                    <span 
                        className="input-group-addon" 
                        style={{cursor: 'pointer'}} 
                        onClick={this.onClear}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                    >
                        <i className="fa fa-fw fa-times" style={{color: '#999'}}/>
                    </span>
                )}
                {/*{(focus || mousefocus) && (*/}
                {/*    <div className="popover bottom"*/}
                {/*         onMouseEnter={this.onMouseEnter}*/}
                {/*         onMouseLeave={this.onMouseLeave}>*/}
                {/*        <div className="arrow"/>*/}
                {/*        <div className="popover-content">*/}
                {/*            {this.getDesc()}*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        )
    }
}
