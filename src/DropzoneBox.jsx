import React, { PropTypes } from 'react';
import icons from './icons.jsx';

class DropzoneBox extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { style, status } = this.props;
    return (
      <svg style={style.svg}>
        <g>
          <rect rx="5" ry="5" style={{ ...style.rect, ...style[status] }} />
        </g>
        { icons[status]() }
      </svg>
    );
  }
}

DropzoneBox.propTypes = {
  style: PropTypes.object,
  state: PropTypes.string,
};

export default DropzoneBox;
