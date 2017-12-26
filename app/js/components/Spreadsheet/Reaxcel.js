"use strict";

import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

class Reaxcel extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.name = "Reaxcel";
        this.state = {
            data: this.props.initialData,
            descending: false,
            edit: null,
            search: null,
            sortby: null
        };
        this._log = [];
        this._download = this._download.bind(this);
        this._logSetState = this._logSetState.bind(this);
        this._preSearchData = null;
        this._renderSearch = this._renderSearch.bind(this);
        this._renderTable = this._renderTable.bind(this);
        this._renderToolbar = this._renderToolbar.bind(this);
        this._replay = this._replay.bind(this);
        this._save = this._save.bind(this);
        this._search = this._search.bind(this);
        this._showEditor = this._showEditor.bind(this);
        this._sort = this._sort.bind(this);
        this._toggleSearch = this._toggleSearch.bind(this);
    }
    _download(format, ev) {
        let contents = format === 'json' ?
            JSON.stringify(this.state.data) :
            this.state.data.reduce(function (result, row) {
                return result +
                    row.reduce(function (rowresult, cell, idx) {
                        return rowresult +
                            '"' +
                            cell.replace(/"/g, '""') +
                            '"' +
                            (idx < row.length - 1 ? ',' : '');
                    }, '') +
                    "\n";
            }, '');

        let URL = window.URL || window.webkitURL;
        let blob = new Blob([contents], {
            type: 'text/' + format
        });

        ev.target.href = URL.createObjectURL(blob);
        ev.target.download = 'data.' + format;
    }
    _logSetState(newState) {
        this._log.push(JSON.parse(JSON.stringify(
            this._log.length === 0 ? this.state : newState
        )));
        this.setState(newState);
    }
    _renderTable() {
        let state = this.state;

        return (
            <table>
                <thead onClick={this._sort}>
                    <tr>
                        {
                            this.props.headers.map(function(title, idx) {
                                return (
                                    <th key={idx}>
                                        {
                                            state.sortby === idx
                                            ? state.descending
                                                ? title + ' \u2191'
                                                : title + ' \u2193'
                                            : title
                                        }
                                    </th>
                                );
                            })
                        }
                    </tr>
                </thead>
                <tbody onDoubleClick={this._showEditor}>
                    {this._renderSearch()}
                    {
                        this.state.data.map(function(row, idx) {
                            return (
                                <tr key={idx}>
                                    {
                                        row.map(function(cell, idx) {
                                            return <td key={idx}>{cell}</td>;
                                        })
                                    }
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        );
    }
    _renderToolbar() {
        return (
            <div className="toolbar">
                <button onClick={this._toggleSearch}>
                    search
                </button>
                <a onClick={this._download.bind(this, 'json')} href="data.json">
                    Export JSON
                </a>
                <a onClick={this._download.bind(this, 'csv')} href="data.json">
                    Export CSV
                </a>
            </div>
        );
    }
    _renderSearch() {
        if (!this.state.search) {
            return null;
        }
        return (
            <tr onChange={this._search}>
                {
                    this.props.headers.map(function (_ignore, idx) {
                        return (
                            <td key={idx}>
                                <input type="text" data-idx={idx} />
                            </td>
                        );
                    })
                }
            </tr>
        );
    }
    _replay() {
        if (this._log.length === 0) {
            console.warn("No state to replay yet");
            return;
        }
        let idx = -1;
        let interval = setInterval(function () {
            idx++;
            if (idx === this._log.length - 1) {
                clearInterval(interval);
            }
            this.setState(this._log[idx]);
        }.bind(this), 1000);
    }
    _save(e) {
        let input = e.target.firstChild;
        var data = this.state.data.slice();

        e.preventDefault();

        data[this.state.edit.row][this.state.edit.cell] = input.value;

        this._logSetState({
            data: data,
            edit: null
        });
    }
    _search(e) {
        let needle = e.target.value.toLowerCase();

        if (!needle) {
            this._logSetState({
                data: this._preSearchData
            });
            return;
        }

        let idx = e.target.dataset.idx;
        let searchdata = this._preSearchData.filter(function (row) {
            return row[idx].toString().toLowerCase().indexOf(needle) > -1;
        });
        this._logSetState({
            data: searchdata
        });
    }
    _sort(e) {
        let column = e.target.cellIndex;
        let data = this.state.data.slice();
        let descending = this.state.sortby === column && !this.state.descending;

        data.sort(function (a, b) {
            return descending ? (a[column] < b[column] ? 1 : -1) : (a[column] > b[column] ? 1 : -1);
        });

        this._logSetState({
            data: data,
            sortby: column,
            descending: descending
        });
    }
    _showEditor(e) {
        this._logSetState({
            edit: {
                row: parseInt(e.target.dataset.row, 10),
                cell: e.target.cellIndex
            }
        });
    }
    _toggleSearch() {
        if (this.state.search) {
            this._logSetState({
                data: this._preSearchData,
                search: false
            });
            this._preSearchData = null;
        } else {
            this._preSearchData = this.state.data;
            this._logSetState({
                search: true,
            });
        }
    }
    componentDidMount() {
        document.onkeydown = function (e) {
            if (e.altKey && e.shiftKey && e.keyCode === 87) { //ALT+SHITF+W
                this._replay();
            }
        }.bind(this);
    }
    render() {
        return (
            <div>
                {this._renderToolbar()}
                {this._renderTable()}
            </div>
        );
    }
}

Reaxcel.propTypes = {
    headers: PropTypes.arrayOf(
        PropTypes.string
    ),
    initialData: PropTypes.arrayOf(
        PropTypes.arrayOf(
            PropTypes.string
        )
    )
};

export default Reaxcel;