import { FaPlay } from 'react-icons/fa'

export default function FeaturedCard() {
  return (
    <div className="featured-card">
      <img 
        src="https://i.scdn.co/image/ab67616d00001e02b1c4b76e23414c9f20242268" 
        alt="Featured" 
        className="featured-img"
      />
      <div className="featured-info">
        <h2>Your Daily Mix</h2>
        <p>Made for you based on your listening history. Updates daily with new music you'll love.</p>
        <button className="featured-btn">
          <FaPlay style={{ marginRight: '8px' }} />
          PLAY
        </button>
      </div>
    </div>
  )
}