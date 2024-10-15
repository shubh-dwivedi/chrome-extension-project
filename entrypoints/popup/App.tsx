import AiMessageIcon from '/ai-icon.svg';
import './App.css';

function App() {
  return (
    <>
      <div className='flex flex-col justify-center content-center'>
        <img src={AiMessageIcon} className="logo react" alt="React logo"/>
        <p className='text-2xl'>AI Linkedin Message Writer</p>
      </div>
      <p className="read-the-docs mt-2">
        This is a demo chrome extension that provides the user ability to get AI based suggestions while writing a message in LinkedIn. This extension is built on React, Typescript and Tailwind.
      </p>
    </>
  );
}

export default App;
