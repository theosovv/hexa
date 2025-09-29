import { createGlobalStyle } from "styled-components";
import normalize from "styled-normalize";

export const GlobalStyle = createGlobalStyle`
  ${normalize}

  body {
    padding: 0;
    background-color: black;
  }

  h1, h2, h3, h4, h5, a, p, li {
    margin: 0;
    padding: 0;
  }
`;
