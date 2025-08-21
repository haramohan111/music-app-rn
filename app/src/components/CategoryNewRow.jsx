import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { fetchAllMusic } from '../redux/features/music/allMusicSlice';
import MusicCard from './MusicCard';

// import '../styles/AllMusic.css';

export default function CategoryNewRow({title,tracks, isLoading, error}) {
// console.log(tracks, "tracks in CategoryNewRow");


  return (
    <>
      <div className="category-row">
        <div className="row-header">
          <h2 className="row-title">{title}</h2>
          <a href="#" className="see-all">See All</a>
        </div>

        {isLoading && <p className="loading-error">Loading...</p>}
        {error && <p className="loading-error">Error: {error}</p>}

        {tracks?.data?.length > 0 && (
          <div className="row-content">
            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={16}
              slidesPerView={"auto"}
              slidesPerGroup={5} // This makes it move 4 items at a time
              breakpoints={{
                320: {
                  slidesPerView: 2,
                  slidesPerGroup: 2 // Move 2 at a time on mobile
                },
                480: {
                  slidesPerView: 3,
                  slidesPerGroup: 3
                },
                640: {
                  slidesPerView: 3,
                  slidesPerGroup: 3
                },
                768: {
                  slidesPerView: 4,
                  slidesPerGroup: 4
                },
                1024: {
                  slidesPerView: 5,
                  slidesPerGroup: 4 // Still move 4 even when showing 5
                },
                1280: {
                  slidesPerView: 6,
                  slidesPerGroup: 4 // Still move 4 even when showing 6
                }
              }}
            >
              {tracks?.data.map((item) => (
                <SwiperSlide key={item._id}>
                  <MusicCard
                    title={item?.title}
                    musicId={item?._id}
                    subtitle={item?.artist || item?.description}
                    cover={item?.coverImage}
                    audioFile={item?.audioFile}
                    onPlay={item?.audioFile}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </>
  );
}