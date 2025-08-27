import { useNode } from '@craftjs/core';
import { ReactNode } from 'react';

// Container Component
export const Container = ({ children, background = 'bg-white', padding = 'p-4' }: {
  children: ReactNode;
  background?: string;
  padding?: string;
}) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={ref => connect(drag(ref))}
      className={`${background} ${padding}`}
    >
      {children}
    </div>
  );
};

Container.craft = {
  displayName: 'Container',
  props: {
    background: 'bg-white',
    padding: 'p-4',
  },
  rules: {
    canDrop: () => true,
  },
};

// Text Component
export const Text = ({ 
  text = 'Escriba aquí', 
  fontSize = 'text-base',
  fontWeight = 'font-normal',
  color = 'text-gray-900',
  textAlign = 'text-left'
}: {
  text: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: string;
}) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <p
      ref={ref => connect(drag(ref))}
      className={`${fontSize} ${fontWeight} ${color} ${textAlign}`}
    >
      {text}
    </p>
  );
};

Text.craft = {
  displayName: 'Text',
  props: {
    text: 'Escriba aquí',
    fontSize: 'text-base',
    fontWeight: 'font-normal',
    color: 'text-gray-900',
    textAlign: 'text-left',
  },
};

// Image Component
export const Image = ({
  src = 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
  alt = 'Imagen',
  width = 'w-full',
  height = 'h-48'
}: {
  src: string;
  alt?: string;
  width?: string;
  height?: string;
}) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <img
      ref={ref => connect(drag(ref))}
      src={src}
      alt={alt}
      className={`${width} ${height} object-cover rounded-lg`}
    />
  );
};

Image.craft = {
  displayName: 'Image',
  props: {
    src: 'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Imagen',
    width: 'w-full',
    height: 'h-48',
  },
};

// Button Component
export const Button = ({
  text = 'Botón',
  backgroundColor = 'bg-primary-500',
  textColor = 'text-white',
  padding = 'px-4 py-2',
  rounded = 'rounded-lg'
}: {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  rounded?: string;
}) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <button
      ref={ref => connect(drag(ref))}
      className={`${backgroundColor} ${textColor} ${padding} ${rounded} font-medium hover:opacity-90 transition-opacity`}
    >
      {text}
    </button>
  );
};

Button.craft = {
  displayName: 'Button',
  props: {
    text: 'Botón',
    backgroundColor: 'bg-primary-500',
    textColor: 'text-white',
    padding: 'px-4 py-2',
    rounded: 'rounded-lg',
  },
};

// Columns Component
export const Columns = ({ children }: { children: ReactNode }) => {
  const { connectors: { connect, drag } } = useNode();

  return (
    <div
      ref={ref => connect(drag(ref))}
      className="grid md:grid-cols-2 gap-6"
    >
      {children}
    </div>
  );
};

Columns.craft = {
  displayName: 'Columns',
  rules: {
    canDrop: () => true,
  },
};

export const CraftRenderer = {
  Container,
  Text,
  Image,
  Button,
  Columns,
};