const Navigation = ({ onRouteChange, signedIn }) => {
    if (signedIn) {
      return (
        <div>
          <nav style={{ display: 'flex', justifyContent: 'flex-end', padding: '5px' }}>
            <p
              onClick={() => onRouteChange('signin')} // Utilisation correcte de onRouteChange
              className="dim white ma2 pointer f6 link dim ph3 pv2 mb2 dib white bg-mid-gray"
            >
              Sign Out
            </p>
          </nav>
        </div>
      );
    } else {
      return (
        <div>
          <nav style={{ display: 'flex', justifyContent: 'flex-end', padding: '5px' }}>
            <p
              onClick={() => onRouteChange('signin')} // Utilisation correcte de onRouteChange
              className="dim white ma2 pointer f6 link dim ph3 pv2 mb2 dib white bg-mid-gray"
            >
              Sign In
            </p>
            <p
              onClick={() => onRouteChange('register')} // Utilisation correcte de onRouteChange
              className="dim white ma2 pointer f6 link dim ph3 pv2 mb2 dib white bg-mid-gray"
            >
              Register
            </p>
          </nav>
        </div>
      );
    }
  };
  
  export default Navigation;
  