import React from 'react';
import PropTypes from 'prop-types';
import createMathComponent from './createMathComponent';

const InlineMath = ({ html, className }) => {
    return <math className={className} dangerouslySetInnerHTML={{ __html: html }} />;
};

InlineMath.propTypes = {
    html: PropTypes.string.isRequired
};

export default createMathComponent(InlineMath, { displayMode: false });