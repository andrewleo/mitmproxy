import * as React from "react"
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import shallowEqual from 'shallowequal'
import AutoScroll from './helpers/AutoScroll'
import { calcVScroll } from './helpers/VirtualScroll'
import FlowTableHead from './FlowTable/FlowTableHead'
import FlowRow from './FlowTable/FlowRow'
import Filt from "../filt/filt"


class FlowTable extends React.Component {

    static propTypes = {
        flows: PropTypes.array.isRequired,
        rowHeight: PropTypes.number,
        highlight: PropTypes.string,
        selected: PropTypes.object,
    }

    static defaultProps = {
        rowHeight: 20,
    }

    constructor(props, context) {
        super(props, context)

        this.state = {
            vScroll: calcVScroll(),
            isUpdate: false
        }
        this.onViewportUpdate = this.onViewportUpdate.bind(this)
        this._isUpdating = false
    }

    UNSAFE_componentWillMount() {
        window.addEventListener('resize', this.onViewportUpdate)
    }

    UNSAFE_componentWillUnmount() {
        window.removeEventListener('resize', this.onViewportUpdate)
    }

    componentDidUpdate(prevProps) {
        // Only update vScroll if the number of flows changed
        if (!this._isUpdating && prevProps.flows.length !== this.props.flows.length) {
            this._isUpdating = true
            this.onViewportUpdate()
            this._isUpdating = false
        }

        if (!this.shouldScrollIntoView) {
            return
        }

        this.shouldScrollIntoView = false

        const { rowHeight, flows, selected } = this.props
        const viewport = ReactDOM.findDOMNode(this)
        const head = ReactDOM.findDOMNode(this.refs.head)

        const headHeight = head ? head.offsetHeight : 0

        const rowTop = (flows.indexOf(selected) * rowHeight) + headHeight
        const rowBottom = rowTop + rowHeight

        const viewportTop = viewport.scrollTop
        const viewportHeight = viewport.offsetHeight

        // Account for pinned thead
        if (rowTop - headHeight < viewportTop) {
            viewport.scrollTop = rowTop - headHeight
        } else if (rowBottom > viewportTop + viewportHeight) {
            viewport.scrollTop = rowBottom - viewportHeight
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.selected && nextProps.selected !== this.props.selected) {
            this.shouldScrollIntoView = true
        }
    }

    onViewportUpdate() {
        // Guard against recursive calls
        if (this._isUpdating) {
            return
        }

        const viewport = ReactDOM.findDOMNode(this)
        const viewportTop = viewport.scrollTop || 0

        const vScroll = calcVScroll({
            viewportTop,
            viewportHeight: viewport.offsetHeight || 0,
            itemCount: this.props.flows.length,
            rowHeight: this.props.rowHeight,
        })

        if (this.state.viewportTop !== viewportTop || !shallowEqual(this.state.vScroll, vScroll)) {
            this._isUpdating = true
            this.setState({ vScroll, viewportTop }, () => {
                this._isUpdating = false
            })
        }
    }

    render() {
        const { vScroll, viewportTop } = this.state
        const { flows, selected, highlight } = this.props
        let isHighlighted = () => false
        if (highlight) {
            try {
                isHighlighted = Filt.parse(highlight)
            } catch (e) {
                isHighlighted = () => false
            }
        }

        const safeStart = (vScroll && typeof vScroll.start === 'number' && !isNaN(vScroll.start)) 
            ? Math.max(0, Math.floor(vScroll.start)) 
            : 0
        const safeEnd = (vScroll && typeof vScroll.end === 'number' && !isNaN(vScroll.end)) 
            ? Math.max(safeStart, Math.floor(vScroll.end)) 
            : 0
        const safePaddingTop = (vScroll && typeof vScroll.paddingTop === 'number' && !isNaN(vScroll.paddingTop)) 
            ? vScroll.paddingTop 
            : 0
        const safePaddingBottom = (vScroll && typeof vScroll.paddingBottom === 'number' && !isNaN(vScroll.paddingBottom)) 
            ? vScroll.paddingBottom 
            : 0

        const flowsToRender = (Array.isArray(flows) && flows.length > 0)
            ? flows.slice(safeStart, safeEnd).filter(flow => flow && flow.id)
            : []

        return (
            <div className="flow-table" onScroll={this.onViewportUpdate}>
                <table>
                    <thead ref="head" style={{ transform: `translateY(${viewportTop}px)` }}>
                        <FlowTableHead />
                    </thead>
                    <tbody>
                        <tr style={{ height: safePaddingTop }}/>
                        {flowsToRender.map(flow => {
                            if (!flow || !flow.id) {
                                return null
                            }
                            try {
                                return (
                                    <FlowRow
                                        key={flow.id}
                                        flow={flow}
                                        selected={flow === selected}
                                        highlighted={isHighlighted(flow)}
                                    />
                                )
                            } catch (e) {
                                console.error('Error rendering FlowRow:', e, flow)
                                return null
                            }
                        })}
                        <tr style={{ height: safePaddingBottom }}/>
                    </tbody>
                </table>
            </div>
        )
    }
}

export const PureFlowTable = AutoScroll(FlowTable)

export default connect(
    state => ({
        flows: state.flows.view,
        highlight: state.flows.highlight,
        selected: state.flows.byId[state.flows.selected[0]],
    })
)(PureFlowTable)
