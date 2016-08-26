import React, { PropTypes } from 'react';
import accepts from 'attr-accept';
import DropzoneBox from './DropzoneBox.jsx';

const block = 'react-dropzone';

export const states = {
  IDLE: 'idle',
  DROPPING: 'dropping',
  BUSY: 'busy',
  DROPPED: 'dropped',
  ERROR: 'error',
};

// credit: gmmorris - https://gist.github.com/gmmorris/0bb6e36730ac3de521d4
function deepAccessUsingString(obj, key) {
  return key.split('.').reduce((nestedObject, key) => {
    if (nestedObject && key in nestedObject) {
      return nestedObject[key];
    }
    return undefined;
  }, obj);
}

function stringFormat(str, replacements) {
  const placeholders = /\{[a-zA-Z0-9_.]*?}/g;
  const braces = /\{|}/g;
  return str.replace(placeholders, item =>
    deepAccessUsingString(replacements, item.replace(braces, '')));
}

// helpers
const defer = (cb) => setTimeout(cb, 10);
const stopPropagation = (ev) => ev.stopPropagation();

export const defaultStyles = {
  wrap: {
    width: '100%',
    height: '5em',
    position: 'relative',
    padding: '2em 0',
    color: '#999',
    textAlign: 'center',
    fontSize: '.85em',
    fontWeight: '600',
  },
  inner: {
    width: '100%',
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
    textAlign: 'center',
  },
  dropping: {
    color: '#00b9ff',
  },
  input: {
    opacity: 0,
    position: 'absolute',
  },

  box: {
    svg: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      zIndex: '0',
      top: '0',
      left: '0',
      borderRadius: '5px',
    },
    rect: {
      width: '100%',
      height: '100%',
      borderRadius: '5px',
      strokeWidth: 5,
      strokeDasharray: '5,5',
    },
    idle: {
      fill: '#f8f8f8',
      stroke: '#ddd',
    },
    dropping: {
      fill: '#eef8ff',
      stroke: '#67d5ff',
      strokeDashoffset: '-9999px',
      transition: 'stroke-dashoffset 300s linear',
    },
    dropped: {
      fill: 'none',
    },
    error: {
      fill: '#fff5f5',
      stroke: '#ffabab',
      strokeWidth: '3px',
      strokeDasharray: '5,5',
    },
    icon: {
      marginBottom: '1em',
    },
  },
};

export class Dropzone extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      file: null,
      status: states.IDLE,
    };

    this._onDrop = this._onDrop.bind(this);
    this._dragOver = this._dragOver.bind(this);
    this._dragLeave = this._dragLeave.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onClick = this._onClick.bind(this);
  }

  _resetState() {
    this.setState({
      status: states.IDLE,
      error: ''
    });
  }

  _setError(label, replacements={}) {
    this.setState({
      status: states.ERROR,
      error: stringFormat(label, replacements)
    });
  }

  _dragOver(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    ev.nativeEvent.dataTransfer.dropEffect = 'copy';
    if (!this.state.status !== states.DROPPING) {
      this.setState({
        status: states.DROPPING,
        error: '',
      });
    }
  }

  _dragLeave(ev) {
    if (this.props.dragLeave) {
      this.props.dragLeave(ev);
    }

    return this._dragEnd(ev);
  }

  _dragEnd(ev) {
    ev.preventDefault();

    if (this.props.dragEnd) {
      this.props.dragEnd(ev);
    }

    this.setState({ status: states.IDLE });
  }

  _onDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this._resetState();

    this.setState({
      status: states.BUSY,
    });

    const file = ev.nativeEvent.dataTransfer.files[0];
    if (!this._accepts(file)) {
      return this._setError(this.props.labels.badFormat, {
        value: this.props.accept,
      });
    }

    defer(() => this._readFile(file, ev));
  }

  _onChange(ev) {
    return this._onDrop(ev);
  }

  _onClick(ev) {
    ev.stopPropagation();
    return this._fileInput.click();
  }

  _readFile(file, dropEvent) {
    const imageLoad = (ev) => {
      const img = ev.target;

      const fileInfo = {
        data: file,
        name: file.name,
        size: file.size,
        url: img.src,
        width: img.width,
        height: img.height,
      };

      if (this._validate(fileInfo)) {
        this.setState({
          status: states.DROPPED,
          file: fileInfo,
        });

        if (this.props.onDrop) {
          this.props.onDrop(dropEvent, file, fileInfo);
        }
      } else {
        this.setState({ file: null });
      }
    };

    const reader = new FileReader();
    reader.onload = ev => {
      if (reader.readyState === 2) {
        const img = new Image();
        img.onload = imageLoad;
        img.src = ev.target.result.toString();
      }
    };
    reader.readAsDataURL(file);
  }

  _accepts(file) {
    return accepts(file, this.props.accept);
  }

  _validate(file) {
    const { width, height, size } = file;
    const { maxDimensions, maxSize, square, labels } = this.props;

    if (maxDimensions) {
      const [ maxWidth, maxHeight ] = maxDimensions;
      if (width > maxWidth || height > maxHeight) {
        return this._setError(labels.maxDimensionsExceeded, {
          value: `${width}x${height}px`,
        });
      }
    }

    if (maxSize && size > maxSize) {
      return this._setError(labels.maxSizeExceeded, {
        value: maxSize / 1000 + 'kB',
      });
    }

    if (square && image.width !== image.height) {
      return this._setError(labels.squareRequired);
    }

    return true;
  }

  _getImageStyles() {
    const dimensions = this._parentElement.getBoundingClientRect();
    return {
      maxWidth: dimensions.width,
      maxHeight: dimensions.height,
    };
  }

  render() {
    const { status, error, file } = this.state;
    const { className, accept, styles, labels } = this.props;

    const wrapperClassNames = [block, `${block}--${status}`, className].join(' ');

    return (
      <div
        className={wrapperClassNames}
        style={{ ...styles.wrap, ...styles[status] }}
        ref={(c) => this._parentElement = c}
        onDragOver={this._dragOver}
        onDragLeave={this._dragLeave}
        onDrop={this._onDrop}
        onClick={this._onClick}
      >
        <DropzoneBox style={styles.box} status={status} />
        <div className={`${block}__inner`} style={styles.inner}>
          <input
            type="file"
            accept={accept}
            style={styles.input}
            ref={(c) => this._fileInput = c}
            onChange={this._onChange}
            onClick={stopPropagation}
          />

          {file
            ? <img
                className={`${block}__preview`}
                src={file.url}
                alt={file.name}
                style={this._getImageStyles()}
              />
            : null }

          {error
            ? <div className={`${block}__label ${block}__label--error`}>
                {error}
              </div>
            : null}

          {!file && !error
            ? <div className={`${block}__label`}>
                {labels.idle}
              </div>
            : null}
        </div>
      </div>
    );
  }
}

Dropzone.propTypes = {
  className: PropTypes.string, // custom classname
  accept: PropTypes.string, // mimetype
  onChange: PropTypes.func, // fired when file is added and is valid
  maxSize: PropTypes.number, // maximum file size in bytes
  maxDimensions: PropTypes.array, // array of maximum width and height
  square: PropTypes.bool, // restrict images to square aspect ratio
  styles: PropTypes.object, // css object
  labels: PropTypes.object, // labels overrides
  children: React.PropTypes.node,
};

Dropzone.defaultProps = {
  className: '',
  accept: 'image/*',
  maxSize: null,
  maxDimensions: null,
  square: false,
  styles: defaultStyles,
  labels: {
    idle: 'Drop a file here or click to select a file',
    loading: 'Loading your file',
    badFormat: 'The file must conform to {value}',
    maxSizeExceeded: 'The file size is too large. Maximum file size is {value}.',
    maxDimensionsExceeded: 'The dimensions are too great. Maximum dimensions are {value}.',
    squareRequired: 'The image should be square. You can crop this image using Preview.',
  },
};

export default Dropzone;
