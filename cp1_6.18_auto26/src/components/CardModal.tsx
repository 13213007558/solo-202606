import React, { useState, useRef, useEffect } from 'react';

export type CardMode = 'text' | 'image' | 'audio';

export interface CardData {
  type: CardMode;
  content: string;
  images: string[];
  audioData: string;
  waveform: number[];
  duration: number;
}

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CardData) => void;
}

const MAX_RECORD_TIME = 45;
const WAVEFORM_BARS = 50;

const CardModal: React.FC<CardModalProps> = ({ isOpen, onClose, onSubmit }) => {
