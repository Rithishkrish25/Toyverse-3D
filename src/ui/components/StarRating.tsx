import React from 'react';

interface StarRatingProps {
  /** Number of filled stars (0–3). */
  stars: number;
  /** Optional size in px for each star. */
  size?: number;
}

/**
 * Renders 0–3 filled stars out of 3 total.
 * @param stars - The number of filled stars.
 * @param size - Pixel size for each star (default 24).
 * @returns A row of star characters.
 */
export default function StarRating({ stars, size = 24 }: StarRatingProps): React.ReactElement {
  return (
    <div className="star-rating" style={{ display: 'flex', gap: '4px' }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            fontSize: `${size}px`,
            color: i < stars ? '#FFD700' : '#444',
            lineHeight: 1,
            // Sequential scale-in animation (Requirement 13.4)
            animation: i < stars
              ? `star-fill 400ms ease-out ${i * 150}ms both`
              : 'none',
            display: 'inline-block',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
