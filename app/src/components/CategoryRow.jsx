import MusicCard from './MusicCard'

export default function CategoryRow({ title, items }) {
  return (
    <div className="category-row">
      <div className="row-header">
        <h2 className="row-title">{title}</h2>
        <a href="#" className="see-all">See All</a>
      </div>
      <div className="row-content">
        {items?.data?.map(item => (
          <MusicCard 
            key={item?._id}
            title={item?.title}
            subtitle={item?.artist || item?.description}
            cover={item?.coverImage}
          />
        ))}
      </div>
    </div>
  )
}