import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';
import thunk from 'redux-thunk';
import reducers from '../reducers';
import authentication from '../utilities/authentication';
// import appDesign from '../utilities/app-design';
// import appHomePage from '../utilities/app-home-page';
// import appMiscSettings from '../utilities/app-misc-settings';
import appSettings from '../utilities/app-settings';
// import collectionListings from '../utilities/collection-listing';
import goLive from '../reducers/go-live';
// import providerShopDetails from '../utilities/provider-shop-details';
import triggerBuild from '../utilities/trigger-build';
import ThemeOptions from '../reducers/ThemeOptions';

export default function configureStore() {
  // const store = createStore(reducer, initialState, composedMiddlewares(middlewares));
  const store = createStore(
    combineReducers({
      authentication,
      goLive,
      appSettings,
      // appMiscSettings,
      // appDesign,
      // collectionListings,
      triggerBuild,
      // providerShopDetails,
      // appHomePage
      ThemeOptions,
      form: reduxFormReducer
      // ...reducers
    }),
    compose(
      applyMiddleware(thunk),
      window.devToolsExtension ? window.devToolsExtension() : f => f
    )
  );
  if (module.hot) {
    // TODO : see if reducers can be moved to feature modules and still get HMR working
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default;
      store.replaceReducer(nextReducer);
    });
  }
  return store;
}
