"use client"
import * as React from "react"
import axios from "axios"
import Image from 'next/image'
import styles from './page.module.css'
import { Amplify, Auth } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from '../src/aws-exports';
Amplify.configure(awsExports);

export default function Home() {
  const [filePDF, setFilePDF] = React.useState(null);

  const handleSelectFilePDF = async (event) => {
    console.log('PDF: ', (event.target.files[0]));
    setFilePDF(event.target.files[0]);
  };

  const getHeader = async () => {   // Funcion para obtener el jwt usando la libreria aws-amplify
    try {
      const response = await Auth.currentAuthenticatedUser();
      return {
        Authorization: `Bearer ${response.signInUserSession.idToken.jwtToken}`
      }
    } catch (error) {
      console.log(error)
    }
  };
  const uploadPDF = async (_metadata, _filePDF) => {
    try {
      const websocketEndpoint = `wss://c0iftqyb14.execute-api.us-west-1.amazonaws.com/development`; // WEBSOCKET ENDPOINT
      const websocket = new WebSocket(websocketEndpoint);

      websocket.onopen = () => { };

      websocket.onmessage = async (event) => {
        const message = JSON.parse(event.data);

        if (message.message === 'Conexión establecida') await uploadFiles(message.connectionId, _filePDF, _metadata);

        else if (message.message === "Certificado listo.") console.log('aca va el redirect o lo que sea');

        else console.log('mensaje no identificado')
      };

      websocket.onerror = (error) => {
        /* aca llega solo en caso de que se caiga la conexion al websocket */
        console.error('Error en la conexión WebSocket:', error);
      };

      /* funcion que sube tanto el pdf como la metadata */
      const uploadFiles = async (_connectionId, _filePDF, _metadata) => {
        console.log(_connectionId)
        const headers = await getHeader();  // Funcion para obtener el jwt usando la libreria aws-amplify
        const apiUrl = 'https://6df3h4js5g.execute-api.us-west-1.amazonaws.com/development';    // API REST, distinta al websocket

        const response = await axios.get(`${apiUrl}/s3/pdf?connectionId=${_connectionId}`, { headers })
        const { uploadJSONURL, uploadPDFURL } = response.data.body

        const promise1 = await fetch(uploadPDFURL, {
          method: "PUT",
          body: _filePDF,
        });

        if (promise1.ok) await fetch(uploadJSONURL, {
          method: "PUT",
          body: JSON.stringify(_metadata),
        });
      };

    } catch (error) {
      console.log(error)
    }
  };

  return (
    <main className={styles.main}>
      <Authenticator>
        {({ signOut, user }) => (
          <main>
            <h1>Hello {user.username}</h1>
            <button onClick={signOut}>Sign out</button>
          </main>
        )}
      </Authenticator>
      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>app/page.js</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
        <div className={styles.buttons}>
          <input type='file' accept=".pdf" name="selectFile" id="selectFile" onChange={handleSelectFilePDF} />
          <button disabled={!filePDF} onClick={() => uploadPDF({ name: 'Nombre', sku: 'SKU', case: 'Admin' }, filePDF)}>FINALIZAR SUBIDA</button>
        </div>
      </div>

      <div className={styles.grid}>
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Docs <span>-&gt;</span>
          </h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Learn <span>-&gt;</span>
          </h2>
          <p>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Templates <span>-&gt;</span>
          </h2>
          <p>Explore the Next.js 13 playground.</p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Deploy <span>-&gt;</span>
          </h2>
          <p>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  )
}
