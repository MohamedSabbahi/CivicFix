import { Component } from 'react';

import { MapPin } from 'lucide-react';

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MapErrorBoundary] Map crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-600">
          <div className="text-center p-4">
            <MapPin size={48} className="mx-auto mb-2 text-slate-500" />
            <p className="text-slate-400 text-sm">Map unavailable</p>
            <p className="text-slate-500 text-xs mt-1">Location: {this.props.lat?.toFixed(4)}, {this.props.lng?.toFixed(4)}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}



export default MapErrorBoundary;
