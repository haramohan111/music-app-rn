import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMusic } from '../redux/features/music/allMusicSlice';
import MusicCard from './MusicCard'
import { useEffect } from 'react';
import Player from './Player';

export default function AllMusic() {
    const title = "Trending Playlists"


    const dispatch = useDispatch();
    const { tracks, isLoading, error } = useSelector((state) => state.music);  

    useEffect(() => {
        // Fetch trending playlists when component mounts
        dispatch(fetchAllMusic());
    }, [dispatch]);

  return (<>
    <div className="category-row">
      <div className="row-header">
        <h2 className="row-title">{title}</h2>
        <a href="#" className="see-all">See All</a>
      </div>
      <div className="row-content">
        {tracks?.data?.map(item => (
          <MusicCard 
            key={item?._id}
            title={item?.title}
            subtitle={item?.artist || item?.description}
            cover={item?.coverImage}
            audioFile={item?.audioFile}
             onPlay={item?.audioFile}
          />
        ))}
      </div>
    </div>
    {/* <Player currentSong={tracks?.data} /> */}
    </>
  )
}

const trendingPlaylists = [
  {
    id: 1,
    title: "Today's Top Hits",
    description: "The Weeknd is on top",
    cover: "https://i.scdn.co/image/ab67616d00001e02b1c4b76e23414c9f20242268",
    type: "playlist"
  },
  
]