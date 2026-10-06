import React from 'react';

type PartyAvatarProps = {
  name: string;
  color?: string;
  image?: string;
  size?: number;
};

export function PartyAvatar({ name, color = '#22364F', image, size = 32 }: PartyAvatarProps) {
  const initials = name.
  replace(/^Md\.\s*/, '').
  split(/\s+/).
  filter((w) => /^[A-Za-z]/.test(w)).
  slice(0, 2).
  map((w) => w[0]).
  join('').
  toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }} />);


  }
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}>
      
      {initials}
    </span>);

}