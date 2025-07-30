// src/LandingPage.js
import React from "react";
import logo from "./assets/logo.png"
import gitimg from "./assets/github.png"
import demo from "./assets/TM_3.mp4"
import { useNavigate } from "react-router-dom";

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/500.css'

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: 'Roboto',
        backgroundImage:
          'linear-gradient(to right, lightgray 1px, transparent 1px), linear-gradient(to bottom, lightgray 1px, transparent 1px)',
        backgroundSize: '25px 25px',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <div
        className="header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 40,
          padding: 7,
          width: '85%',
          borderRadius: 20,
          
          backgroundColor: 'white',
          boxShadow: '0px 4px 50px rgba(0,0,0,0.4)',
        broder: '1px solid rgba(0, 0, 0, 1)'
        }}
      >
        <div className="header_left" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <img style={{ marginLeft: 20 }}src={logo} width="50" alt="Logo" />
          <p style={{ fontWeight: 600, fontSize: 20, marginLeft: 20 }}>Automata Simulator</p>
        </div>
        <div className="header_right" style={{ display: 'flex' }}>
          <div
            className="features"
            style={{
              marginRight: 20,
              alignSelf: 'center',
              backgroundColor: 'white',
              color: 'black',
              cursor: 'pointer',
              fontSize: 17,
              fontWeight: 500,
            }}
          >
            Features
          </div>
          <div
            className="about"
            style={{
              marginRight: 20,
              alignSelf: 'center',
              color: 'black',
              fontWeight: 500,
              fontSize: 17,
              cursor: 'pointer',
            }}
          >
            About
          </div>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://github.com/sarthaktodmal/AutomataSimulator"
          >
            <img className="giticon" src={gitimg} width="50" alt="GitHub" style={{ marginRight: 15 }} />
          </a>
        </div>
      </div>

      <div
        className="main"
        style={{ padding: 30, display: 'flex', justifyContent: 'space-around' }}
      >
        <div className="main_left">
          <p style={{ fontSize: 100, fontWeight: 700, margin: 20 }}>
            Finite Automata
            <br />
            Simulator
          </p>
          <p style={{ fontWeight: 300, fontSize: 26, margin: 20, marginBottom: 50 }}>
            A Web-Based Automaton Simulator,
            <br />
            Supports Creation and Step By Step Simulation of DFA, NFA,
            <br />
            PDA, Turing, Mealy & Moore Machines
          </p>
          <button
            onClick={() => navigate("/simulator")}
            style={{
              margin: 20,
              padding: 15,
              textDecoration: 'none',
              color: 'white',
              backgroundColor: 'black',
              borderRadius: 10,
              border: '1px solid black',
              cursor: 'pointer',
              fontSize: 16
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = 'black';
              e.target.style.transitionDuration = '0.5s';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'black';
              e.target.style.color = 'white';
            }}
          >
            Launch Simulator
          </button>
        </div>

        <div className="main_right" style={{ marginTop: 40, marginLeft: 20 }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            width="550"
            style={{
              border: '0px solid black',
              borderRadius: 20,
              padding: 10,
              backgroundColor: 'white',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            <source src={demo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}