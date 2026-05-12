import React, { useState, useEffect, FC } from 'react';
import Nprogress from 'nprogress';
import ReactPlaceholder from 'react-placeholder';
import 'nprogress/nprogress.css';
import 'react-placeholder/lib/reactPlaceholder.css';
import CircularProgress from '../components/layout/CircularProgress';

// The function `asyncComponent` now takes a function that returns a promise of a component (i.e., the result of importing a component).
// It returns a functional component.
const asyncComponent = (importComponent: () => Promise<{ default: React.ComponentType<any> }>): FC => {
  const AsyncFunc: FC<any> = (props:any) => {
    const [Component, setComponent] = useState<React.ReactNode>(null);

    useEffect(() => {
      let mounted = true;
      Nprogress.start();

      // Immediately invoked async function to handle component import
      (async () => {
        const { default: ImportedComponent } = await importComponent();
        Nprogress.done();
        if (mounted) {
          setComponent(<ImportedComponent {...props} />);
        }
      })();

      return () => {
        mounted = false;
        Nprogress.done();
      };
    }, [props]); // Include props if the component needs to react to prop changes

    return (
      <ReactPlaceholder type="text" rows={7} ready={Component !== null}>
        {Component || <CircularProgress />}
      </ReactPlaceholder>
    );
  };

  return AsyncFunc;
};

export default asyncComponent;



// import React from 'react'

// function asyncComponent() {
//   return (
//     <div>asyncComponent</div>
//   )
// }

// export default asyncComponent