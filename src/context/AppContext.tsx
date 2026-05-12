import React from 'react';

export const AppContext = React.createContext<{
	scroll: any;
	setScroll: any;

}>({
	scroll: {},
	setScroll: () => {},
});

