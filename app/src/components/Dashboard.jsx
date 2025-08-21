import {  useEffect, useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Player from './Player'
import FeaturedCard from './FeaturedCard'
import CategoryRow from './CategoryRow'
import '../App.css'
import AllMusic from './AllMusic-test.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPopularAlbums } from '../redux/features/playlist/playlistSlice'
import CategoryNewRow from './CategoryNewRow.jsx'
import { fetchAllMusic } from '../redux/features/music/allMusicSlice.js'
import { toast } from 'react-toastify';
import { resetPlaylistState } from '../redux/features/playlist/playlistSlice';

function Dashboard() {
const dispatch = useDispatch(); 
const {popularAlbums,status} = useSelector((state) => state.playlists);

useEffect(() => {
  dispatch(fetchPopularAlbums());
}, [dispatch]);


  const { tracks, isLoading,error} = useSelector((state) => state.music);

  const { aspstatus,perror } = useSelector((state) => state.playlists);
  useEffect(() => {
    if (aspstatus === 'succeeded') {

      toast.success("Add songs to playlist successfully");
  
    }

    if(perror) {
        console.error('Error adding songs to playlist:', perror);
      toast.error(perror);
     
    }
     dispatch(resetPlaylistState());
  }, [aspstatus,dispatch,perror]);

  useEffect(() => {
    dispatch(fetchAllMusic());
  }, [dispatch]);

    return (
        <>
            {/* <FeaturedCard />
            <CategoryRow title="Recently Played" items={recentlyPlayed} /> */}
            <CategoryNewRow title="Popular Albums" tracks={tracks} isLoading={isLoading} error={error} />
            <CategoryNewRow title="Trending Playlists" tracks={tracks} isLoading={isLoading} error={error} />
            {/* <CategoryRow title="Popular Albums" items={popularAlbums} />
            <CategoryRow title="Trending Playlists" items={trendingPlaylists} /> */}

        </>
    )
}

// Sample data
const recentlyPlayed = [
    {
        id: 1,
        title: "Blinding Lights",
        artist: "The Weeknd",
        cover: "https://i.scdn.co/image/ab67616d00001e02b1c4b76e23414c9f20242268",
        type: "song"
    },
    // Add more items...
]

// const popularAlbums = [
//     {
//         id: 1,
//         title: "After Hours",
//         artist: "The Weeknd",
//         cover: "https://i.scdn.co/image/ab67616d00001e02b1c4b76e23414c9f20242268",
//         type: "album"
//     },
//     // Add more items...
// ]

const trendingPlaylists = [
    {
        id: 1,
        title: "Today's Top Hits",
        description: "The Weeknd is on top",
        cover: "https://i.scdn.co/image/ab67616d00001e02b1c4b76e23414c9f20242268",
        type: "playlist"
    },

]



export default Dashboard