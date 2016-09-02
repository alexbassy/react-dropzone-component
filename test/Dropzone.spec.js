/**
 * Babel Starter Kit (https://www.kriasoft.com/babel-starter-kit)
 *
 * Copyright © 2015-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { Dropzone, states } from '../src/Dropzone.jsx';

describe('Dropzone', () => {

  it('is available', () => {
    expect(Dropzone).to.not.be.null;
  });

  it('mounts correctly', () => {
    const wrapper = shallow(<Dropzone />);
    expect(wrapper).to.not.be.null;
    expect(wrapper.state('status')).to.equal(states.IDLE);
    expect(wrapper.find('.react-dropzone__inner').length).to.equal(1);
  });

  /**
   * @todo test _validate function with a file fixture
   * @todo simulate drop/click events
   * @todo test provided props: onChange; maxSize; labels etc
   */

});
