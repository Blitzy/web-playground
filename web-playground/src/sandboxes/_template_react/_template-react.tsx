import Sandbox from "../Sandbox";
import React from 'react';
import ReactDOM from 'react-dom';

export default class TemplateReactSandbox extends Sandbox {
    loaded: boolean;

    async start(): Promise<void> {
      // Create and mount root react component.
      const root = document.createElement('div');
      root.id = 'react-root';
      document.body.append(root);
      ReactDOM.render(<TemplateApp/>, root);

      this.loaded = true;
    }
}

const TemplateApp: React.FC = () => {
  return (
    <>
      <p>Hello, World!</p>
    </>
  )
}