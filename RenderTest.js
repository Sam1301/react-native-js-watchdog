// modified from https://gist.github.com/joshma/6753333dd38a6010f9a6#file-whydidyouupdatemixin-js

/* eslint-disable no-console */
import _ from 'underscore';
import React, { Component, PureComponent } from 'react';

function isRequiredUpdateObject(o) {
  return Array.isArray(o) || (o && o.constructor === Object.prototype.constructor);
}

function deepDiff(o1, o2, p, verbose) {
  const notify = status => {
    console.warn('Update %s', status);
    console.log('%cbefore', 'font-weight: bold', o1);
    console.log('%cafter ', 'font-weight: bold', o2);
  };
  if (!_.isEqual(o1, o2)) {
    if (verbose) {
      console.group(p);
      if ([o1, o2].every(_.isFunction)) {
        notify('avoidable?');
      } else if (![o1, o2].every(isRequiredUpdateObject)) {
        notify('required.');
      } else {
        const keys = _.union(_.keys(o1), _.keys(o2));
        for (const key of keys) {
          deepDiff(o1[key], o2[key], key, verbose);
        }
      }
      console.groupEnd();
    }
  } else if (o1 !== o2) {
    console.group(p);
    notify('avoidable!');
    if (_.isObject(o1) && _.isObject(o2)) {
      const keys = _.union(_.keys(o1), _.keys(o2));
      for (const key of keys) {
        deepDiff(o1[key], o2[key], key, verbose);
      }
    }
    console.groupEnd();
  }
}

function isPureComponent(WrappedComponent) {
  return !!(WrappedComponent.prototype && WrappedComponent.prototype.isPureReactComponent);
}

const RerenderTest = (WrappedComponent, { verbose }) => {
  const Parent = isPureComponent(WrappedComponent) ? PureComponent : Component;

  return class Container extends Parent {
    componentDidUpdate(prevProps, prevState) {
      deepDiff(
          { props: prevProps, state: prevState },
          { props: this.props, state: this.state },
          WrappedComponent.name, verbose
        );
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}

export default RerenderTest;
