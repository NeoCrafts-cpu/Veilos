import { Component, type ErrorInfo, type ReactNode } from "react";
import { EmptyState } from "./EmptyState.js";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Do not log the thrown value. Wallet/WASM failures can carry connector internals.
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="page">
        <EmptyState
          title="This tab hit a wallet or proving error"
          body="The operator vault was not written. Reconnect the wallet and retry. Proofs that did not return SucceedEntirely were not treated as authorized."
        >
          <button type="button" className="btn" onClick={() => this.setState({ failed: false })}>
            Reload this view
          </button>
        </EmptyState>
      </main>
    );
  }
}
