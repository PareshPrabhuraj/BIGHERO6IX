import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  componentDidCatch(error) {
    this.setState({ error });
  }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-carbon p-8 text-center">
          <div>
            <p className="font-mono text-xs tracking-widest text-cyan">SYSTEM FAULT ISOLATED</p>
            <h1 className="mt-4 text-2xl font-bold text-cream">This section hit a snag.</h1>
            <p className="mt-2 text-sm text-mute">{String(this.state.error)}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
