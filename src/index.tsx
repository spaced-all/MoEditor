import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

import { Page as PageV1, Document } from './BlockEditor';
import { Page } from "./MoEditor"
import App from './App';
import { InlineMath } from './MoEditor/Inline/InlineMath';
// import { InlineMath as OldInlineMatch } from './MoEditor/Inline/MathComponent';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <div className='center'>

      {/* <PageV1></PageV1> */}
      {/* <Page /> */}
      <Page blocks={[
        {
          'type': 'paragraph',
          'order': 'a',
          'paragraph': {
            'children': [
              { 'tagName': '#text', 'textContent': ' Plain Text ' },
              { 'tagName': 'b', 'textContent': ' Bold ' },
              { 'tagName': 's', 'textContent': ' Delete ' },
              { 'tagName': 'i', 'textContent': ' Italic ' },
              { 'tagName': 'code', 'textContent': ' Inline Code ' },
            ]
          }
        },
        {
          'type': 'heading',
          'order': 'b',
          'heading': {
            'level': 1,
            'children': [
              { 'tagName': '#text', 'textContent': ' Plain Text ' },
              { 'tagName': 'b', 'textContent': ' Bold ' },
              { 'tagName': 's', 'textContent': ' Delete ' },
              { 'tagName': 'i', 'textContent': ' Italic ' },
              { 'tagName': 'code', 'textContent': ' Inline Code ' },
            ]
          }
        },
        {
          'type': 'list',
          'order': 'c',
          'list': {
            'children': [
              { 'level': 1, 'children': [{ 'tagName': '#text', 'textContent': ' Plain Text ' },] },
              { 'level': 1, 'children': [{ 'tagName': 'b', 'textContent': ' Bold ' }] },
              { 'level': 1, 'children': [{ 'tagName': 's', 'textContent': ' Delete ' }] },
              { 'level': 1, 'children': [{ 'tagName': 'i', 'textContent': ' Italic ' }] },
              { 'level': 1, 'children': [{ 'tagName': 'code', 'textContent': ' Inline Code ' }] },
            ]
          }
        },
        {
          'type': 'orderedList',
          'order': 'd',
          'list': {
            'children': [
              { 'level': 1, 'children': [{ 'tagName': '#text', 'textContent': ' Plain Text ' },] },
              { 'level': 1, 'children': [{ 'tagName': 'b', 'textContent': ' Bold ' }] },
              { 'level': 1, 'children': [{ 'tagName': 's', 'textContent': ' Delete ' }] },
              { 'level': 1, 'children': [{ 'tagName': 'i', 'textContent': ' Italic ' }] },
              { 'level': 1, 'children': [{ 'tagName': 'code', 'textContent': ' Inline Code ' }] },
            ]
          }
        },
        {
          'type': 'table',
          'order': 'e',
          'table': {
            'children': [
              {
                'children': [
                  { 'children': [{ 'tagName': '#text', 'textContent': ' Plain Text ' },] },
                  { 'children': [{ 'tagName': '#text', 'textContent': ' Plain Text ' },] },
                ]
              },
              {
                'children': [
                  { 'children': [{ 'tagName': 'b', 'textContent': ' Bold ' }] },
                  { 'children': [{ 'tagName': 'b', 'textContent': ' Bold ' }] },
                ]
              },
            ]
          }
        },
        {
          'type': 'paragraph',
          'order': 'f',
          'paragraph': {
            'children': [
              { 'tagName': '#text', 'textContent': ' Plain Text ' },
              {
                'tagName': 'b', 'textContent': ' Bold ', 'children': [
                  {
                    'tagName': 'code', 'textContent': ' Code ', 'children': [
                      { 'tagName': 'i', 'textContent': ' Italic ' },
                    ]
                  },
                ]
              },
              { 'tagName': 'code', 'textContent': ' Inline Code ' },
            ]
          }
        },
      ]}></Page>
    </div>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
