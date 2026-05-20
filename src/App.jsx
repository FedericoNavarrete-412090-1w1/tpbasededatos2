import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api, session } from './api.js';
import FriendsView from './components/FriendsView.jsx';
import RatingModal from './components/RatingModal.jsx';
import {
    Home,
    Search,
    User,
    Activity,
    Share2,
    Play,
    Plus,
    ThumbsUp,
    Database,
    Network,
    ChevronRight,
    ChevronLeft,
    X,
    LogOut,
    Lock,
    Bookmark,
    Heart,
    Send,
    Camera,
    Save,
    Pencil,
    Users,
    Star,
    Sun,
    Moon,
    GripVertical,
    LayoutGrid,
    List,
    Trash2
} from 'lucide-react';

// mockContent removed — using real API data

const avatarOptions = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=150&auto=format&fit=crop',
];

// DB mock removed — using api.js

const timeAgo = (iso) => {
    const now = new Date();
    const then = new Date(iso);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 3600) return `Hace ${Math.max(diff / 60, 1)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return `Hace ${Math.floor(diff / 86400)}d`;
};

const NeonBadge = ({ children, color = 'blue' }) => {
    const colors = {
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
        green: 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
        pink: 'bg-pink-500/10 text-pink-400 border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.2)]',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${colors[color]}`}>
            {children}
        </span>
    );
};

const ContentCard = ({ item, onClick, onAddToList, onLike, onRecommend, onRate, inMyList, isLiked }) => (
    <div
        className="group relative flex-none w-44 md:w-52 cursor-pointer z-10 hover:z-20"
        onClick={() => onClick(item)}
        style={{
            transition: 'transform 0.3s cubic-bezier(0.25,0.8,0.25,1)',
            willChange: 'transform',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
    >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gray-900 border border-gray-800/80 shadow-2xl group-hover:border-gray-600 transition-colors duration-300">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

            {item.match && (
                <div className="absolute top-2.5 left-2.5">
                    <NeonBadge color="green">{item.match}% Afinidad</NeonBadge>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-3.5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-white font-bold text-sm leading-tight truncate tracking-tight">{item.title}</h3>
                <p className="text-gray-400 text-xs mt-0.5 truncate font-medium">{item.type || ''} · {item.year}</p>

                <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                    <div className="flex items-center gap-1.5">
                        <button
                            className="bg-white text-black p-1.5 rounded-full hover:bg-gray-200 hover:scale-110 transition-transform shadow"
                            onClick={(e) => { e.stopPropagation(); onRecommend?.(item); }}
                            title="Recomendar"
                        >
                            <Share2 size={12} />
                        </button>
                        <button
                            className={`p-1.5 rounded-full hover:scale-110 transition-transform ${inMyList ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'}`}
                            onClick={(e) => { e.stopPropagation(); onAddToList?.(item); }}
                            title={inMyList ? 'Quitar de mi lista' : 'Agregar a mi lista'}
                        >
                            <Plus size={12} />
                        </button>
                        <button
                            className={`p-1.5 rounded-full hover:scale-110 transition-transform ${isLiked ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40' : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20'}`}
                            onClick={(e) => { e.stopPropagation(); onLike?.(item); }}
                            title={isLiked ? 'Quitar me gusta' : 'Me gusta'}
                        >
                            <ThumbsUp size={11} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                    <button
                        className="p-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30 hover:scale-110 transition-all"
                        onClick={(e) => { e.stopPropagation(); onRate?.(item); }}
                        title="Calificar"
                    >
                        <Star size={11} fill="currentColor" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ─── BrowseAllModal ────────────────────────────────────────────────────────
const BrowseAllModal = ({ title, items, onClose, onCardClick, onAddToList, onLike, onRecommend, onRate, myListIds, likedIds }) => {
    const [q, setQ] = React.useState('');
    const [sort, setSort] = React.useState('default');

    const filtered = items
        .filter(i => (i.title || '').toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => {
            if (sort === 'az') return (a.title || '').localeCompare(b.title || '');
            if (sort === 'za') return (b.title || '').localeCompare(a.title || '');
            if (sort === 'year_asc') return (a.year || 0) - (b.year || 0);
            if (sort === 'year_desc') return (b.year || 0) - (a.year || 0);
            return 0;
        });

    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" onClick={onClose} />
            <div className="relative z-10 w-full max-w-6xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
                 style={{ background: 'rgba(10,10,20,0.97)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">{title}</h2>
                        <p className="text-gray-400 text-sm mt-0.5">{filtered.length} resultados</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"><X size={20} /></button>
                </div>
                {/* Search + Sort */}
                <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            autoFocus
                            type="text"
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            placeholder="Buscar por nombre..."
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                            className="w-full rounded-xl py-2.5 pl-10 pr-4 focus:outline-none text-sm placeholder-gray-600"
                        />
                    </div>
                    <select
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db' }}
                        className="rounded-xl py-2.5 px-3 text-sm focus:outline-none cursor-pointer"
                    >
                        <option value="default">Orden original</option>
                        <option value="az">A → Z</option>
                        <option value="za">Z → A</option>
                        <option value="year_desc">Más recientes</option>
                        <option value="year_asc">Más antiguos</option>
                    </select>
                </div>
                {/* Grid - only vertical scroll */}
                <div
                    className="flex-1 hide-scrollbar"
                    style={{ overflowY: 'auto', overflowX: 'hidden', padding: '0 24px' }}
                >
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                            <Search size={48} className="mb-3 opacity-30" />
                            <p>Sin resultados para "{q}"</p>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(176px, 1fr))',
                                gap: '20px',
                                paddingTop: '44px',
                                paddingBottom: '24px',
                                paddingRight: '4px',  /* equal breathing room right = left */
                            }}
                        >
                            {filtered.map(item => (
                                <div key={item.id}>
                                    <ContentCard
                                        item={item}
                                        onClick={(i) => { onCardClick(i); }}
                                        onAddToList={onAddToList}
                                        onLike={onLike}
                                        onRecommend={onRecommend}
                                        onRate={onRate}
                                        inMyList={myListIds?.has(item.id)}
                                        isLiked={likedIds?.has(item.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Carousel = ({ title, items, subtitle, icon: Icon, onCardClick, onAddToList, onLike, onRecommend, onRate, myListIds, likedIds, pageSize = 20 }) => {
    const scrollRef = React.useRef(null);
    const [shown, setShown] = React.useState(pageSize);
    const [browseOpen, setBrowseOpen] = React.useState(false);
    const visibleItems = items.slice(0, shown);
    const scroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    return (
        <div className="mb-10 w-full">
            <div className="flex items-end justify-between mb-4 px-2">
                <div>
                    {subtitle && <p className="text-blue-400 text-sm font-medium mb-1 tracking-wider uppercase flex items-center gap-2"><Icon size={14} /> {subtitle}</p>}
                    <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setBrowseOpen(true)}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
                    >
                        Ver todo
                    </button>
                    <button onClick={() => scroll('left')} className="p-1 rounded-full bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 backdrop-blur-sm border border-gray-700 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={() => scroll('right')} className="p-1 rounded-full bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 backdrop-blur-sm border border-gray-700 transition-all">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
            {/* Outer div handles horizontal scroll; inner div overflows vertically for hover effect */}
            <div
                ref={scrollRef}
                className="hide-scrollbar"
                style={{
                    overflowX: 'auto',
                    overflowY: 'visible',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <div className="flex gap-4 md:gap-5 snap-x snap-mandatory" style={{ paddingTop: '56px', paddingBottom: '32px', paddingLeft: '8px', paddingRight: '8px' }}>
                    {visibleItems.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="snap-start flex-none">
                            <ContentCard item={item} onClick={onCardClick} onAddToList={onAddToList} onLike={onLike} onRecommend={onRecommend} onRate={onRate} inMyList={myListIds.has(item.id)} isLiked={likedIds.has(item.id)} />
                        </div>
                    ))}
                </div>
            </div>
            {browseOpen && (
                <BrowseAllModal
                    title={title}
                    items={items}
                    onClose={() => setBrowseOpen(false)}
                    onCardClick={onCardClick}
                    onAddToList={onAddToList}
                    onLike={onLike}
                    onRecommend={onRecommend}
                    onRate={onRate}
                    myListIds={myListIds}
                    likedIds={likedIds}
                />
            )}
        </div>
    );
};

const DetailPage = ({ item, onClose, currentEmail, onAddToList, onLike, onRecommend, myListIds, likedIds, userRating, onRatingSuccess }) => {
    const [detail, setDetail] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [ratingOpen, setRatingOpen] = React.useState(false);
    const [comments, setComments] = React.useState([]);
    const [newComment, setNewComment] = React.useState('');
    const [posting, setPosting] = React.useState(false);

    const inMyList = myListIds?.has(item.id);
    const isLiked = likedIds?.has(item.id);
    const contentType = item.type === 'Serie' ? 'series' : 'movies';

    React.useEffect(() => {
        if (!item) return;
        const fetch = item.type === 'Pelicula' ? api.getMovie(item.id) : api.getSerie(item.id);
        fetch
            .then(d => setDetail(d))
            .catch(() => setDetail(null))
            .finally(() => setLoading(false));
    }, [item?.id]);

    React.useEffect(() => {
        if (!item) return;
        api.getComments(contentType, item.id)
            .then(setComments)
            .catch(() => setComments([]));
    }, [item?.id, contentType]);

    const handlePostComment = async () => {
        if (!newComment.trim() || !currentEmail) return;
        setPosting(true);
        try {
            await api.postComment(contentType, item.id, currentEmail, newComment.trim());
            setNewComment('');
            const updated = await api.getComments(contentType, item.id);
            setComments(updated);
        } catch (e) { console.error(e); }
        finally { setPosting(false); }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.deleteComment(contentType, item.id, commentId, currentEmail);
            setComments(prev => prev.filter(c => c.commentId !== commentId));
        } catch (e) { console.error(e); }
    };

    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!item) return null;

    const renderStars = (avg) => {
        const score = parseFloat(avg) || 0;
        return Array.from({ length: 10 }, (_, i) => (
            <Star key={i} size={14} fill={i < Math.round(score) ? 'currentColor' : 'none'} className={i < Math.round(score) ? 'text-yellow-400' : 'text-gray-600'} />
        ));
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />
            
            {/* Modal Box */}
            <div className="relative w-full max-w-4xl max-h-[85vh] rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-300 bg-gray-950">
                {/* Ambient glow background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-105 pointer-events-none z-0" 
                    style={{ backgroundImage: `url(${detail?.imagen || item.image})` }} 
                />
                {/* Dark gradient mask */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950/75 via-gray-900/90 to-gray-950 z-0 pointer-events-none" />

                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/45 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-all shadow-md backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                {/* Main scrollable body */}
                <div className="relative z-10 w-full max-h-[85vh] overflow-y-auto p-6 md:p-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div>
                        {/* Header Section (Poster Left + Info & Actions Right) */}
                        <div className="flex flex-col md:flex-row gap-6 mb-8">
                            {/* Vertical Poster Column */}
                            <div className="w-full md:w-56 flex-shrink-0 flex justify-center md:block">
                                <img 
                                    src={detail?.imagen || item.image} 
                                    alt={item.title} 
                                    className="w-48 md:w-full h-72 md:h-80 object-cover rounded-2xl shadow-2xl border border-gray-800" 
                                />
                            </div>
                            
                            {/* Info Column */}
                            <div className="flex-1 flex flex-col justify-between py-1 text-left">
                                <div>
                                    <div className="flex items-center gap-3 mb-3 text-sm">
                                        <NeonBadge color="blue">{detail?.tipo || item.type}</NeonBadge>
                                        <span className="text-gray-300 font-medium">{detail?.anio || item.year}</span>
                                        {detail?.duracion && (
                                            <>
                                                <span className="text-gray-500">•</span>
                                                <span className="text-gray-300 font-medium">{detail.duracion} min</span>
                                            </>
                                        )}
                                    </div>
                                    
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">
                                        {detail?.titulo || item.title}
                                    </h1>
                                    
                                    {detail?.promedio && (
                                        <div className="flex items-center gap-2 mt-2 mb-2">
                                            <div className="flex">{renderStars(detail.promedio)}</div>
                                            <span className="text-yellow-400 font-bold">{parseFloat(detail.promedio).toFixed(1)}/10</span>
                                            <span className="text-gray-400 text-xs">puntuación promedio</span>
                                        </div>
                                    )}

                                    {userRating && (
                                        <div className="flex items-center gap-2 mt-2 mb-4 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl px-4 py-2 w-fit">
                                            <span className="text-yellow-400 font-bold text-sm">Tu calificación:</span>
                                            <div className="flex">
                                                {Array.from({ length: 10 }, (_, i) => (
                                                    <Star key={i} size={14} fill={i < userRating ? 'currentColor' : 'none'} className={i < userRating ? 'text-yellow-400' : 'text-gray-600'} />
                                                ))}
                                            </div>
                                            <span className="text-yellow-400 font-black text-sm">{userRating}/10</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Actions Area */}
                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                    <button 
                                        className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-gray-200 hover:scale-105 transition-all text-sm shadow"
                                        onClick={(e) => { e.stopPropagation(); onRecommend?.(item); }}
                                        title="Recomendar"
                                    >
                                        <Share2 size={16} /> Recomendar
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onAddToList?.(item); }}
                                        className={`p-2.5 rounded-full hover:scale-105 transition-all border ${
                                            inMyList 
                                                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30' 
                                                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/15'
                                        }`}
                                        title={inMyList ? 'Quitar de mi lista' : 'Agregar a mi lista'}
                                    >
                                        <Plus size={18} />
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onLike?.(item); }}
                                        className={`p-2.5 rounded-full hover:scale-105 transition-all border ${
                                            isLiked 
                                                ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/30' 
                                                : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/15'
                                        }`}
                                        title={isLiked ? 'Quitar me gusta' : 'Me gusta'}
                                    >
                                        <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
                                    </button>
                                    
                                    <button
                                        onClick={() => setRatingOpen(true)}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-yellow-400 text-black hover:bg-yellow-500 hover:scale-105 transition-all font-bold text-sm shadow animate-none"
                                        title={userRating ? "Editar calificación" : "Calificar"}
                                    >
                                        <Star size={16} fill="currentColor" /> {userRating ? "Editar calificación" : "Calificar"}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Description */}
                        {detail?.descripcion && (
                            <div className="mb-6 text-left">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Descripción</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">{detail.descripcion}</p>
                            </div>
                        )}

                        {/* Genres */}
                        {detail?.generos?.length > 0 && (
                            <div className="mb-4 text-left">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Géneros</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {detail.generos.map(g => (
                                        <span key={g} className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-full text-xs border border-white/10 font-medium">
                                            {g}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Director */}
                        {(detail?.director || detail?.creador) && (
                            <div className="mb-6 text-left">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    {item.type === 'Serie' ? 'Creador' : 'Director'}
                                </h3>
                                <div className="inline-flex bg-white/5 border border-white/10 rounded-xl p-3 min-w-[155px] max-w-[220px] items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                        <User size={14} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-white text-xs font-bold truncate" title={detail.director || detail.creador}>
                                            {detail.director || detail.creador}
                                        </p>
                                        <p className="text-gray-400 text-[10px] truncate">
                                            {item.type === 'Serie' ? 'Creador Principal' : 'Director Principal'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full Width Actors Carousel */}
                        {detail?.actores?.length > 0 && (
                            <div className="border-t border-white/10 pt-6 text-left">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Actores</h3>
                                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                                    {detail.actores.map((a, idx) => (
                                        <div key={idx} className="flex-shrink-0 bg-white/5 border border-white/10 rounded-xl p-3 min-w-[150px] max-w-[180px] flex items-center gap-2.5 hover:bg-white/10 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                                                <User size={14} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-white text-xs font-bold truncate" title={a.nombre || a}>{a.nombre || a}</p>
                                                {a.personaje && (
                                                    <p className="text-gray-400 text-[10px] truncate" title={a.personaje}>{a.personaje}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="border-t border-white/10 pt-6 text-left">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Comentarios ({comments.length})</h3>
                            {currentEmail && (
                                <div className="flex items-start gap-3 mb-5">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(); } }}
                                        placeholder="Escribí un comentario..."
                                        className="flex-1 bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    />
                                    <button
                                        onClick={handlePostComment}
                                        disabled={!newComment.trim() || posting}
                                        className="px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {posting ? <span className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /> : null}
                                        Postear
                                    </button>
                                </div>
                            )}
                            {comments.length === 0 ? (
                                <p className="text-gray-500 text-sm py-4 text-center">Sin comentarios aún. ¡Sé el primero en comentar!</p>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {comments.map((c, idx) => (
                                        <div key={c.commentId || idx} className="bg-gray-800/30 border border-gray-800 rounded-xl p-3 flex items-start gap-3 group">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                {(c.nombre || c.email)[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-white text-sm font-medium">{c.nombre || c.email}</p>
                                                    <p className="text-gray-500 text-[10px]">{timeAgo(c.fecha)}</p>
                                                </div>
                                                <p className="text-gray-300 text-sm leading-relaxed">{c.mensaje}</p>
                                            </div>
                                            {currentEmail === c.email && (
                                                <button
                                                    onClick={() => handleDeleteComment(c.commentId)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Eliminar comentario"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </div>
                {ratingOpen && currentEmail && (
                    <RatingModal
                        item={{ id: item.id, titulo: item.title, tipo: item.type, anio: item.year, imagen: item.image }}
                        currentEmail={currentEmail}
                        onClose={() => setRatingOpen(false)}
                        onSuccess={() => {
                            setRatingOpen(false);
                            onRatingSuccess?.();
                        }}
                    />
                )}
            </div>
        </div>
    );
};




const DetailModal = ({ item, onClose }) => {
    if (!item) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="relative h-64 md:h-96 w-full">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10"></div>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-60" />
                    <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
                        <X size={24} />
                    </button>
                    <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                        <div className="flex items-center gap-3 mb-3">
                            <NeonBadge color="green">{item.match}% Afinidad en Grafo</NeonBadge>
                            <NeonBadge color="blue">{item.type}</NeonBadge>
                            <span className="text-gray-300 text-sm">{item.year}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2 drop-shadow-lg">{item.title}</h1>
                        {item.artist && <h2 className="text-2xl text-gray-300 mb-4">{item.artist}</h2>}
                        <div className="flex items-center gap-4 mt-6">
                            <button className="flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 hover:scale-105 transition-all">
                                <Play fill="currentColor" size={20} /> Reproducir
                            </button>
                            <button className="p-3 border border-gray-500 rounded-full text-white hover:border-white hover:bg-white/10 transition-all">
                                <Plus size={20} />
                            </button>
                            <button className="p-3 border border-gray-500 rounded-full text-white hover:border-white hover:bg-white/10 transition-all">
                                <ThumbsUp size={20} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Acerca de</h3>
                            <p className="text-gray-300 leading-relaxed text-lg">{item.description || `Basado en tu historial con la categoría '${item.genres[0]}' y la similitud con otros usuarios de tu clúster, este contenido es altamente recomendado para ti.`}</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-3">Lógica de Recomendación por Grafo</h3>
                            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-gray-300"><Network size={18} className="text-blue-400" /><span>Conectado vía <strong className="text-white">Clúster de Género '{item.genres[0]}'</strong></span></div>
                                <div className="flex items-center gap-3 text-gray-300"><User size={18} className="text-purple-400" /><span>34 usuarios similares también interactuaron con esto</span></div>
                                <div className="flex items-center gap-3 text-gray-300"><Share2 size={18} className="text-green-400" /><span>Camino más corto: Tú &rarr; Nodo '{item.genres[0]}' &rarr; {item.title}</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Géneros</h3>
                            <div className="flex flex-wrap gap-2">{item.genres.map(g => (<span key={g} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700 hover:border-gray-500 cursor-pointer transition-colors">{g}</span>))}</div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Métricas de Grafo</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-gray-400">Centralidad del Nodo</span><span className="text-white">Alta (0.84)</span></div>
                                <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '84%' }}></div></div>
                                <div className="flex justify-between text-sm mt-3"><span className="text-gray-400">Peso de Conexiones</span><span className="text-white">Fuerte</span></div>
                                <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '92%' }}></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GraphDashboard = ({ currentUser, onItemClick }) => {
    const [data, setData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [visibleLinks, setVisibleLinks] = useState({
        ES_AMIGO_DE: true, LE_GUSTÓ: true, GUARDÓ: true, CALIFICÓ: true
    });

    const dragNodeRef = useRef(null);
    const nodesRef = useRef([]);
    const containerRef = useRef(null);
    const isPanningRef = useRef(false);
    const dragMovedRef = useRef(false);

    const width = 1100;
    const height = 650;

    const linkConfig = {
        ES_AMIGO_DE: { color: [168, 85, 247], label: 'Amigos', icon: '👥', dashed: true },
        LE_GUSTÓ: { color: [236, 72, 153], label: 'Le Gustó', icon: '❤️', dashed: false },
        GUARDÓ: { color: [59, 130, 246], label: 'Guardó', icon: '📌', dashed: false },
        CALIFICÓ: { color: [234, 179, 8], label: 'Calificó', icon: '⭐', dashed: false },
    };

    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);
        api.getNetwork(currentUser.email)
            .then(res => {
                const nodes = res.nodes.map((node, index) => {
                    const angle = (index / res.nodes.length) * 2 * Math.PI;
                    const radius = 220 + Math.random() * 120;
                    return { ...node, x: width / 2 + Math.cos(angle) * radius, y: height / 2 + Math.sin(angle) * radius, vx: 0, vy: 0, fx: null, fy: null };
                });
                const links = res.links.map(link => ({ ...link, sourceNode: nodes.find(n => n.id === link.source), targetNode: nodes.find(n => n.id === link.target) })).filter(l => l.sourceNode && l.targetNode);
                nodesRef.current = nodes;
                setData({ nodes, links });
                setLoading(false);
            })
            .catch(err => { console.error(err); setError("Error al cargar el grafo."); setLoading(false); });
    }, [currentUser]);

    useEffect(() => {
        if (loading || data.nodes.length === 0) return;
        let animFrame;
        const tick = () => {
            const nodes = nodesRef.current;
            const links = data.links;
            const kRepulsion = 40000;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const n1 = nodes[i], n2 = nodes[j];
                    const dx = n1.x - n2.x, dy = n1.y - n2.y;
                    const distSq = dx * dx + dy * dy || 1;
                    const dist = Math.sqrt(distSq);
                    if (dist < 450) {
                        const force = kRepulsion / distSq;
                        const fx = (dx / dist) * force, fy = (dy / dist) * force;
                        if (n1.fx === null) { n1.vx += fx; n1.vy += fy; }
                        if (n2.fx === null) { n2.vx -= fx; n2.vy -= fy; }
                    }
                }
            }
            links.forEach(l => {
                if (!visibleLinks[l.type]) return;
                const s = l.sourceNode, t = l.targetNode;
                const dx = t.x - s.x, dy = t.y - s.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const restLength = l.type === 'ES_AMIGO_DE' ? 360 : 180;
                const force = (dist - restLength) * 0.025;
                const fx = (dx / dist) * force, fy = (dy / dist) * force;
                if (s.fx === null) { s.vx += fx; s.vy += fy; }
                if (t.fx === null) { t.vx -= fx; t.vy -= fy; }
            });
            nodes.forEach(n => {
                if (n.fx !== null) { n.x = n.fx; n.y = n.fy; n.vx = 0; n.vy = 0; }
                else {
                    n.vx += (width / 2 - n.x) * 0.006; n.vy += (height / 2 - n.y) * 0.006;
                    n.x += n.vx; n.y += n.vy; n.vx *= 0.86; n.vy *= 0.86;
                    n.x = Math.max(40, Math.min(width - 40, n.x)); n.y = Math.max(40, Math.min(height - 40, n.y));
                }
            });
            setData(prev => ({ ...prev, nodes: [...nodes] }));
            animFrame = requestAnimationFrame(tick);
        };
        animFrame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animFrame);
    }, [loading, data.links, visibleLinks]);

    const handlePointerDown = (e, node) => {
        e.preventDefault();
        e.stopPropagation();
        dragMovedRef.current = false;
        dragNodeRef.current = node;
        node.fx = node.x; node.fy = node.y;
        const container = containerRef.current;
        const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
        const startX = e.clientX, startY = e.clientY;
        const cpx = panX, cpy = panY, cz = zoom;
        const handlePointerMove = (moveEvent) => {
            if (!dragNodeRef.current) return;
            if (Math.abs(moveEvent.clientX - startX) > 4 || Math.abs(moveEvent.clientY - startY) > 4) {
                dragMovedRef.current = true;
            }
            const x = (moveEvent.clientX - rect.left - rect.width / 2 - cpx) / cz + width / 2;
            const y = (moveEvent.clientY - rect.top - rect.height / 2 - cpy) / cz + height / 2;
            dragNodeRef.current.fx = Math.max(25, Math.min(width - 25, x));
            dragNodeRef.current.fy = Math.max(25, Math.min(height - 25, y));
        };
        const handlePointerUp = () => {
            if (dragNodeRef.current) { dragNodeRef.current.fx = null; dragNodeRef.current.fy = null; dragNodeRef.current = null; }
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    const handlePanStart = (e) => {
        if (dragNodeRef.current) return;
        isPanningRef.current = true;
        const startX = e.clientX, startY = e.clientY;
        const startPanX = panX, startPanY = panY;
        const onMove = (mv) => {
            if (!isPanningRef.current) return;
            setPanX(startPanX + (mv.clientX - startX));
            setPanY(startPanY + (mv.clientY - startY));
        };
        const onUp = () => {
            isPanningRef.current = false;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const stats = React.useMemo(() => {
        const users = data.nodes.filter(n => n.type === 'Usuario').length;
        const content = data.nodes.filter(n => n.type !== 'Usuario').length;
        return { users, content, totalNodes: data.nodes.length, totalLinks: data.links.length,
            friends: data.links.filter(l => l.type === 'ES_AMIGO_DE').length,
            likes: data.links.filter(l => l.type === 'LE_GUSTÓ').length,
            saves: data.links.filter(l => l.type === 'GUARDÓ').length,
            rates: data.links.filter(l => l.type === 'CALIFICÓ').length };
    }, [data]);

    const hoveredConnections = React.useMemo(() => {
        if (!hoveredNode) return [];
        return data.links.filter(l => l.source === hoveredNode.id || l.target === hoveredNode.id);
    }, [hoveredNode, data.links]);

    // IDs de contenido conectado directamente al usuario actual
    const myContentIds = React.useMemo(() => {
        const currentUserId = data.nodes.find(n => n.isCurrentUser)?.id;
        if (!currentUserId) return new Set();
        return new Set(
            data.links
                .filter(l => l.source === currentUserId || l.target === currentUserId)
                .map(l => l.source === currentUserId ? l.target : l.source)
        );
    }, [data.nodes, data.links]);

    const visibleNodeIds = React.useMemo(() => {
        return new Set(data.nodes.filter(node => {
            if (!visibleLinks.ES_AMIGO_DE) {
                if (node.type === 'Usuario' && !node.isCurrentUser) return false;
                if (node.type !== 'Usuario' && !myContentIds.has(node.id)) return false;
            }
            return true;
        }).map(n => n.id));
    }, [data.nodes, visibleLinks.ES_AMIGO_DE, myContentIds]);

    if (loading) return (<div className="flex flex-col items-center justify-center py-32 text-gray-400"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" /><p>Cargando...</p></div>);
    if (error) return (<div className="text-center py-20 text-red-400 bg-gray-900/40 border border-red-900/20 rounded-3xl"><Database size={48} className="mx-auto mb-4 opacity-50 text-red-500" /><p>{error}</p></div>);

    const filteredLinks = data.links.filter(l =>
        visibleLinks[l.type] &&
        visibleNodeIds.has(l.source) &&
        visibleNodeIds.has(l.target)
    );

    return (
        <div className="animate-in fade-in duration-500 text-left">
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Network className="text-blue-500" size={36} /> Descubrir
                </h1>
                <p className="text-gray-400 text-sm">Explorá cómo se conectan tus gustos con los de tus amigos. Arrastrá los nodos y usá los filtros para navegar tus conexiones.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Nodos', value: stats.totalNodes, icon: '🔵', color: 'from-blue-500/20 to-blue-600/5 border-blue-500/20' },
                    { label: 'Relaciones', value: stats.totalLinks, icon: '🔗', color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20' },
                    { label: 'Amigos', value: stats.friends, icon: '👥', color: 'from-violet-500/20 to-violet-600/5 border-violet-500/20' },
                    { label: 'Contenido', value: stats.content, icon: '🎬', color: 'from-pink-500/20 to-pink-600/5 border-pink-500/20' },
                ].map((s, i) => (
                    <div key={i} className={`bg-gradient-to-br ${s.color} border rounded-2xl p-4 flex items-center gap-3`}>
                        <span className="text-2xl">{s.icon}</span>
                        <div>
                            <p className="text-2xl font-black text-white leading-none">{s.value}</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter toggles */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mr-2">Filtrar:</span>
                {Object.entries(linkConfig).map(([type, cfg]) => {
                    const active = visibleLinks[type];
                    const count = data.links.filter(l => l.type === type).length;
                    const [r, g, b] = cfg.color;
                    return (
                        <button key={type} onClick={() => setVisibleLinks(prev => ({ ...prev, [type]: !prev[type] }))}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${active ? 'text-white' : 'bg-gray-900/50 border-white/5 text-gray-500 opacity-50 hover:opacity-75'}`}
                            style={active ? { background: `rgba(${r},${g},${b},0.15)`, borderColor: `rgba(${r},${g},${b},0.4)`, boxShadow: `0 0 12px rgba(${r},${g},${b},0.25)` } : {}}
                        >
                            <span>{cfg.icon}</span><span>{cfg.label}</span>
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/10' : 'bg-white/5'}`}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Graph Canvas */}
            <div ref={containerRef} className="relative bg-gray-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] select-none cursor-grab active:cursor-grabbing" onPointerDown={handlePanStart} style={{ height: '650px' }}>
                {/* Grid bg */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-[0.04]">
                    <defs><pattern id="graphGrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#graphGrid)" />
                </svg>

                {/* Scaled Wrapper for 1:1 Pixel Mapping */}
                <div 
                    className="absolute pointer-events-none"
                    style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        left: '50%',
                        top: '50%',
                        transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`,
                        transformOrigin: 'center center',
                    }}
                >
                    {/* Links SVG */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
                        <defs>
                            {Object.entries(linkConfig).map(([type, cfg]) => (
                                <React.Fragment key={type}>
                                    <filter id={`glow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                                    </filter>
                                </React.Fragment>
                            ))}
                        </defs>
                        {filteredLinks.map((link, idx) => {
                            const isHovered = hoveredNode?.id === link.source || hoveredNode?.id === link.target;
                            const cfg = linkConfig[link.type] || { color: [255, 255, 255], dashed: false };
                            const [r, g, b] = cfg.color;
                            return (
                                <g key={idx}>
                                    {/* Glow line */}
                                    <line x1={link.sourceNode.x} y1={link.sourceNode.y} x2={link.targetNode.x} y2={link.targetNode.y}
                                        stroke={`rgba(${r},${g},${b},${isHovered ? 0.5 : 0.12})`} strokeWidth={isHovered ? 8 : 4} strokeLinecap="round"
                                        style={{ filter: `blur(${isHovered ? 4 : 2}px)` }} />
                                    {/* Main line */}
                                    <line x1={link.sourceNode.x} y1={link.sourceNode.y} x2={link.targetNode.x} y2={link.targetNode.y}
                                        stroke={`rgba(${r},${g},${b},${isHovered ? 0.85 : 0.35})`} strokeWidth={isHovered ? 2.5 : 1.5}
                                        strokeDasharray={cfg.dashed ? "6,4" : "none"} strokeLinecap="round" />
                                    {/* Animated particle on hover */}
                                    {isHovered && (
                                        <circle r="3.5" fill={`rgb(${r},${g},${b})`} filter={`url(#glow-${link.type})`}>
                                            <animateMotion dur="1.5s" repeatCount="indefinite"
                                                path={`M${link.sourceNode.x},${link.sourceNode.y} L${link.targetNode.x},${link.targetNode.y}`} />
                                        </circle>
                                    )}
                                    {/* Relationship label on hover */}
                                    {isHovered && (
                                        <text x={(link.sourceNode.x + link.targetNode.x) / 2} y={(link.sourceNode.y + link.targetNode.y) / 2 - 10}
                                            textAnchor="middle" fill={`rgb(${r},${g},${b})`} fontSize="9" fontWeight="bold"
                                            style={{ textShadow: `0 0 8px rgba(${r},${g},${b},0.6)` }}>
                                            {link.type.replace(/_/g, ' ')}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    {/* Nodes Layer */}
                    <div className="absolute inset-0 pointer-events-auto z-10">
                        {data.nodes.filter(node => {
                            if (!visibleLinks.ES_AMIGO_DE) {
                                if (node.type === 'Usuario' && !node.isCurrentUser) return false;
                                if (node.type !== 'Usuario' && !myContentIds.has(node.id)) return false;
                            }
                            return true;
                        }).map((node) => {
                            const isUser = node.type === 'Usuario';
                            const isCurrent = node.isCurrentUser;
                            const hasImage = !!node.imagen;
                            const isHov = hoveredNode?.id === node.id;
                            const connCount = data.links.filter(l => l.source === node.id || l.target === node.id).length;
                            const baseSize = isCurrent ? 56 : isUser ? 48 : (34 + Math.min(connCount * 3, 14));

                            let borderStyle = "border-white/15 bg-gray-900/80";
                            let glowShadow = "0 4px 12px rgba(0,0,0,0.4)";
                            if (isCurrent) { borderStyle = "border-blue-400 bg-blue-950/90 text-blue-300"; glowShadow = "0 0 20px rgba(59,130,246,0.6), 0 0 40px rgba(59,130,246,0.2)"; }
                            else if (isUser) { borderStyle = "border-purple-400 bg-purple-950/80 text-purple-300"; glowShadow = "0 0 15px rgba(168,85,247,0.5)"; }
                            else if (hasImage) { borderStyle = "border-white/10"; glowShadow = isHov ? "0 0 20px rgba(6,182,212,0.5)" : "0 4px 15px rgba(0,0,0,0.5)"; }

                            return (
                                <div key={node.id}
                                        className={`absolute rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-[transform,background-color,border-color,box-shadow,width,height] duration-200 border-2 select-none ${borderStyle}`}
                                    style={{
                                        left: `${node.x}px`, top: `${node.y}px`,
                                        transform: `translate(-50%, -50%) ${isHov ? 'scale(1.2)' : ''}`,
                                        width: `${baseSize}px`, height: `${baseSize}px`, boxShadow: glowShadow,
                                        zIndex: isHov ? 50 : isCurrent ? 30 : 20,
                                    }}
                                    onPointerDown={(e) => handlePointerDown(e, node)}
                                    onMouseEnter={() => setHoveredNode(node)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                    onClick={() => { if (!isUser && !dragMovedRef.current) { onItemClick({ id: node.id, type: node.type === 'Serie' ? 'Serie' : 'Pelicula', titulo: node.label, imagen: node.imagen }); } }}
                                >
                                    {isUser ? (<User size={isCurrent ? 22 : 18} />) : hasImage ? (
                                        <img src={node.imagen} alt={node.label} className="w-full h-full rounded-full object-cover pointer-events-none" />
                                    ) : (<Play size={14} className="text-gray-400 pointer-events-none" />)}

                                    <div className={`absolute top-full mt-2 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap pointer-events-none shadow-lg ${isHov ? 'bg-white text-gray-900' : 'bg-black/90 border border-white/10 text-gray-200 backdrop-blur-sm'}`}
                                        style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {node.label}
                                    </div>

                                    {isHov && connCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-cyan-500/50">
                                            {connCount}
                                        </div>
                                    )}
                                    {isCurrent && (<div className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-ping" style={{ animationDuration: '2.5s' }} />)}
                                </div>
                            );
                        })}
                    </div>

                    {/* Scan line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)] pointer-events-none animate-[graphScan_5s_linear_infinite]" />
                </div>

                {/* Hover info card */}
                {hoveredNode && (
                    <div className="absolute bottom-4 left-4 bg-gray-900/97 border border-white/10 rounded-2xl p-4 w-72 z-30 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200">
                        <div className="flex items-start gap-3">
                            {hoveredNode.type === 'Usuario' ? (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${hoveredNode.isCurrentUser ? 'bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/30' : 'bg-purple-500/20 text-purple-400 ring-2 ring-purple-500/30'}`}>
                                    <User size={22} />
                                </div>
                            ) : hoveredNode.imagen ? (
                                <img src={hoveredNode.imagen} alt="" className="w-12 h-16 rounded-xl object-cover flex-shrink-0 ring-1 ring-white/10" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0"><Play size={20} /></div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{hoveredNode.type}</p>
                                <p className="text-white text-sm font-bold truncate leading-tight">{hoveredNode.label}</p>
                            </div>
                        </div>
                        {hoveredConnections.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/5">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">{hoveredConnections.length} conexiones</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(linkConfig).map(([type, cfg]) => {
                                        const count = hoveredConnections.filter(l => l.type === type).length;
                                        if (!count) return null;
                                        const [r, g, b] = cfg.color;
                                        return (<span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: `rgba(${r},${g},${b},0.12)`, color: `rgb(${r},${g},${b})` }}>{cfg.icon} {count}</span>);
                                    })}
                                </div>
                            </div>
                        )}
                        {!hoveredNode.isCurrentUser && hoveredNode.type !== 'Usuario' && (
                            <p className="text-cyan-400 text-[10px] font-semibold mt-3 flex items-center gap-1 cursor-pointer hover:underline">
                                <Play size={10} fill="currentColor" /> Click para ver detalles
                            </p>
                        )}
                    </div>
                )}

                {/* Zoom controls */}
                <div className="absolute top-4 right-4 z-30 flex flex-col gap-1.5">
                    <button onClick={() => setZoom(z => Math.min(z + 0.15, 1.8))} className="w-8 h-8 rounded-xl bg-gray-800/90 border border-white/10 text-white flex items-center justify-center hover:bg-gray-700/90 transition-colors text-sm font-bold shadow-lg backdrop-blur-sm" title="Acercar">+</button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.5))} className="w-8 h-8 rounded-xl bg-gray-800/90 border border-white/10 text-white flex items-center justify-center hover:bg-gray-700/90 transition-colors text-sm font-bold shadow-lg backdrop-blur-sm" title="Alejar">−</button>
                    <button onClick={() => { setZoom(1); setPanX(0); setPanY(0); }} className="w-8 h-8 rounded-xl bg-gray-800/90 border border-white/10 text-gray-400 flex items-center justify-center hover:bg-gray-700/90 hover:text-white transition-colors text-[10px] font-bold shadow-lg backdrop-blur-sm" title="Restablecer vista">1:1</button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `@keyframes graphScan { 0% { transform: translateY(0); } 100% { transform: translateY(650px); } }` }} />
        </div>
    );
};


const BadgesSection = ({ cals }) => {
    const total = cals.length;
    const genreCount = {};
    const monthCount = {};
    cals.forEach(c => {
        (c.generos || c.contenido?.generos || []).forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; });
        const fecha = c.fecha || '';
        const month = fecha.slice(0, 7);
        if (month) monthCount[month] = (monthCount[month] || 0) + 1;
    });
    const topGenreEntry = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];
    const hasSpecialist = topGenreEntry && topGenreEntry[1] >= 5;
    const hasMarathon = Object.values(monthCount).some(v => v >= 3);
    const hasPerfect = cals.some(c => c.puntuacion === 10);

    const badges = [
        { emoji: '🎬', title: 'Primer paso', desc: '1+ calificación', earned: total >= 1 },
        { emoji: '⭐', title: 'Crítico en formación', desc: '5+ calificaciones', earned: total >= 5 },
        { emoji: '🏆', title: 'Cinéfilo', desc: '10+ calificaciones', earned: total >= 10 },
        { emoji: '💯', title: 'Perfeccionista', desc: 'Una calificación perfecta (10/10)', earned: hasPerfect },
        { emoji: '🎭', title: 'Especialista', desc: hasSpecialist ? `5+ en el género "${topGenreEntry[0]}"` : '5+ en el mismo género', earned: hasSpecialist },
        { emoji: '🔥', title: 'Maratonista', desc: '3+ calificaciones en el mismo mes', earned: hasMarathon },
    ];

    return (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Tus logros</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map((b, i) => (
                    <div key={i} className={`relative rounded-2xl border p-4 flex flex-col items-center text-center transition-all ${
                        b.earned
                            ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                            : 'bg-gray-900/40 border-gray-800 opacity-40'
                    }`}>
                        <span className="text-3xl mb-2">{b.emoji}</span>
                        <p className="text-white font-bold text-sm">{b.title}</p>
                        <p className="text-gray-400 text-xs mt-1">{b.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProfileStats = ({ email }) => {
    const [cals, setCals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getCalificaciones(email)
            .then(data => setCals(Array.isArray(data) ? data : []))
            .catch(() => setCals([]))
            .finally(() => setLoading(false));
    }, [email]);

    const total = cals.length;
    const avg = total > 0 ? (cals.reduce((s, c) => s + (c.puntuacion || 0), 0) / total).toFixed(1) : '—';

    // Géneros favoritos: contar ocurrencias en generos[] de cada item calificado
    const genreCount = {};
    cals.forEach(c => {
        (c.generos || c.contenido?.generos || []).forEach(g => {
            genreCount[g] = (genreCount[g] || 0) + 1;
        });
    });
    const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g]) => g);

    if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Tu actividad</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                    <p className="text-sm text-gray-400 mb-1">Calificaciones</p>
                    <p className="text-3xl font-bold text-white">{total}</p>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
                    <p className="text-sm text-gray-400 mb-1">Puntuación media</p>
                    <p className="text-3xl font-bold text-yellow-400 flex items-center gap-1"><Star size={20} fill="currentColor" />{avg}</p>
                </div>
                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-400 mb-2">Géneros favoritos</p>
                    {topGenres.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {topGenres.map(g => <span key={g} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-xs font-medium">{g}</span>)}
                        </div>
                    ) : <p className="text-gray-500 text-sm">Sin datos aún</p>}
                </div>
            </div>
            {total > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Últimas calificaciones</h3>
                    <div className="space-y-3">
                        {cals.slice(0, 5).map((c, i) => (
                            <div key={i} className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
                                {(c.imagen || c.contenido?.imagen) && <img src={c.imagen || c.contenido?.imagen} alt="" className="w-12 h-16 object-cover rounded-lg flex-none" />}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{c.titulo || c.contenido?.titulo || 'Sin título'}</p>
                                    <p className="text-gray-500 text-xs">{c.tipo || c.contenido?.tipo || ''} · {c.fecha || ''}</p>
                                    {c.resena && <p className="text-gray-400 text-sm mt-1 line-clamp-1 italic">"{c.resena}"</p>}
                                </div>
                                <div className="flex items-center gap-1 text-yellow-400 font-bold text-lg flex-none">
                                    <Star size={16} fill="currentColor" />{c.puntuacion}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <BadgesSection cals={cals} />
        </div>
    );
};

const ProfileView = ({ onLogout, currentUser, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(currentUser.name);
    const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
    const fileInputRef = useRef(null);

    const handleSave = () => {
        if (editName.trim()) {
            onUpdateProfile(editName.trim(), editAvatar);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditName(currentUser.name);
        setEditAvatar(currentUser.avatar);
        setIsEditing(false);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return;
            const reader = new FileReader();
            reader.onload = (ev) => setEditAvatar(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto relative">
            {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="absolute top-0 right-0 flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors text-sm font-medium">
                    <Pencil size={16} /> Editar perfil
                </button>
            )}
            {isEditing && (
                <div className="absolute top-0 right-0 flex items-center gap-2">
                    <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-400 rounded-xl hover:bg-gray-700 transition-colors text-sm"><X size={16} /> Cancelar</button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors text-sm font-medium"><Save size={16} /> Guardar</button>
                </div>
            )}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                <div className="relative">
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-gray-800 shadow-2xl relative z-10 cursor-pointer group" onClick={() => isEditing && fileInputRef.current?.click()}>
                        <img src={editAvatar || avatarOptions[0]} alt="Profile" className="w-full h-full object-cover" />
                        {isEditing && <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={32} /></div>}
                    </div>
                    {isEditing && <div className="absolute -bottom-2 -right-2 z-20 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-lg" onClick={() => fileInputRef.current?.click()}><Camera size={18} /></div>}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl -z-0 transform scale-110"></div>
                </div>
                <div className="text-center md:text-left flex-1">
                    {isEditing ? (
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 text-3xl md:text-5xl font-extrabold focus:ring-2 focus:ring-blue-500 outline-none text-center md:text-left w-full mb-2" />
                    ) : (
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-1">{currentUser.name}</h1>
                    )}
                    <p className="text-blue-400 text-sm mb-1">{currentUser.email}</p>
                    {currentUser.pais && <p className="text-gray-500 text-sm mb-4">📍 {currentUser.pais}</p>}
                    <p className="text-gray-400 text-sm mb-6">Explorador de Grafos · GraphRecs</p>
                </div>
            </div>
            {isEditing && (
                <div className="mb-10 bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Camera size={20} className="text-blue-400" /> Elegir foto de perfil</h3>
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl hover:bg-purple-500/20 transition-colors text-sm font-medium"><Camera size={16} /> Subir imagen desde mi computadora</button>
                        <span className="text-gray-500 text-sm">JPG, PNG, GIF (max 2MB)</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">O elegí un avatar predeterminado:</p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                        {avatarOptions.map((avatar, idx) => (
                            <button key={idx} onClick={() => setEditAvatar(avatar)} className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${editAvatar === avatar ? 'border-blue-500 ring-4 ring-blue-500/30 scale-110' : 'border-gray-700 hover:border-gray-500'}`}><img src={avatar} alt="" className="w-full h-full object-cover" /></button>
                        ))}
                    </div>
                </div>
            )}
            <ProfileStats email={currentUser.email} />
            <div className="pt-8 mb-12 border-t border-gray-800">
                <button onClick={onLogout} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"><LogOut size={18} /> Cerrar sesión</button>
            </div>
        </div>
    );
};

const CinematicTransition = ({ onComplete, onEnded }) => {
    const [step, setStep] = useState(3);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep(prev => {
                if (prev > 1) {
                    return prev - 1;
                } else if (prev === 1) {
                    setTimeout(() => {
                        onComplete();
                    }, 100);
                    return "PLAY";
                } else {
                    clearInterval(timer);
                    setIsFadingOut(true);
                    setTimeout(() => {
                        onEnded();
                    }, 700);
                    return prev;
                }
            });
        }, 750);

        return () => clearInterval(timer);
    }, [onComplete, onEnded]);

    return (
        <div className={`fixed inset-0 z-[9999] bg-[#030305] flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-700 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="absolute inset-0 bg-radial-projector pointer-events-none opacity-20 animate-projector-flicker"></div>
            <div className="absolute inset-0 pointer-events-none opacity-25 bg-film-noise animate-noise"></div>
            <div className="absolute top-0 bottom-0 left-[35%] w-[1px] bg-white/10 pointer-events-none animate-scratch-1"></div>
            <div className="absolute top-0 bottom-0 left-[68%] w-[1.5px] bg-white/15 pointer-events-none animate-scratch-2"></div>

            <div className="relative w-64 h-64 border-4 border-white/20 rounded-full flex items-center justify-center animate-[pulse_0.4s_infinite_alternate]">
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/10 -translate-x-1/2"></div>
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/10 -translate-y-1/2"></div>
                <div className="absolute inset-4 border-2 border-white/10 rounded-full"></div>
                <div className="absolute inset-8 border border-dashed border-white/15 rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent origin-center rounded-full animate-[spin_0.8s_linear_infinite]"></div>

                <span className="text-white text-8xl font-mono font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] z-10 select-none animate-[scale-down_0.8s_ease-in-out_infinite]">
                    {step}
                </span>
            </div>

            <p className="mt-8 text-xs font-mono uppercase tracking-[0.4em] text-gray-500 animate-pulse">
                Iniciando Reproductor de Cine
            </p>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes projector-flicker {
                    0%, 100% { opacity: 0.15; }
                    25% { opacity: 0.25; }
                    50% { opacity: 0.18; }
                    75% { opacity: 0.28; }
                }
                @keyframes scale-down {
                    0% { transform: scale(1.1); }
                    100% { transform: scale(0.9); }
                }
                @keyframes noise {
                    0% { transform: translate(0, 0); }
                    10% { transform: translate(-1%, -1%); }
                    20% { transform: translate(1%, 2%); }
                    30% { transform: translate(-2%, -2%); }
                    40% { transform: translate(1%, 3%); }
                    50% { transform: translate(-1%, 1%); }
                    60% { transform: translate(2%, -1%); }
                    70% { transform: translate(-2%, 1%); }
                    80% { transform: translate(1%, -2%); }
                    90% { transform: translate(-1%, 3%); }
                    100% { transform: translate(0, 0); }
                }
                @keyframes scratch-move-1 {
                    0% { left: 35%; opacity: 0; }
                    5% { opacity: 0.3; }
                    10% { left: 34.5%; opacity: 0.1; }
                    15% { opacity: 0; }
                    50% { left: 36%; opacity: 0; }
                    55% { opacity: 0.4; }
                    60% { left: 35.8%; opacity: 0.2; }
                    65% { opacity: 0; }
                    100% { left: 35%; opacity: 0; }
                }
                @keyframes scratch-move-2 {
                    0% { left: 68%; opacity: 0; }
                    12% { opacity: 0; }
                    13% { left: 67%; opacity: 0.5; }
                    15% { left: 67.2%; opacity: 0.2; }
                    18% { opacity: 0; }
                    70% { left: 69%; opacity: 0; }
                    72% { left: 68.5%; opacity: 0.4; }
                    74% { opacity: 0.1; }
                    76% { opacity: 0; }
                    100% { left: 68%; opacity: 0; }
                }
                .animate-projector-flicker {
                    animation: projector-flicker 0.15s infinite;
                }
                .animate-noise {
                    background-image: radial-gradient(circle, #fff 10%, transparent 11%), radial-gradient(circle, #fff 10%, transparent 11%);
                    background-size: 8px 8px;
                    background-position: 0 0, 4px 4px;
                    animation: noise 0.2s steps(4) infinite;
                }
                .animate-scratch-1 {
                    animation: scratch-move-1 3s infinite;
                }
                .animate-scratch-2 {
                    animation: scratch-move-2 2.5s infinite;
                }
                .bg-radial-projector {
                    background: radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 70%);
                }
            `}} />
        </div>
    );
};

const LoginView = ({ onLogin, onUserChange }) => {
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loggingIn, setLoggingIn] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newAvatar, setNewAvatar] = useState(avatarOptions[0]);
    const [createError, setCreateError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { setCreateError('La imagen debe ser menor a 2MB'); return; }
            const reader = new FileReader();
            reader.onload = (ev) => setNewAvatar(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoggingIn(true);
        try {
            const user = await api.login(username, password);
            session.set(user);
            onUserChange(user);
            setTimeout(() => onLogin(), 400);
        } catch (err) {
            setLoggingIn(false);
            setError(err.message || 'Email o contraseña incorrectos');
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!newName.trim()) { setCreateError('El nombre es obligatorio'); return; }
        if (newName.length < 2) { setCreateError('El nombre debe tener al menos 2 caracteres'); return; }
        if (!newEmail.trim() || !newEmail.includes('@')) { setCreateError('Ingresá un email válido'); return; }
        if (!newPassword) { setCreateError('La contraseña es obligatoria'); return; }
        if (newPassword.length < 4) { setCreateError('La contraseña debe tener al menos 4 caracteres'); return; }
        try {
            const user = await api.register(newName, newEmail, '', newPassword);
            session.set(user);
            onUserChange(user);
            setTimeout(() => onLogin(), 400);
        } catch (err) {
            setCreateError(err.message || 'Ese email ya está registrado');
        }
    };

    // Animated floating particles background
    const particles = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        size: 2 + (i % 4),
        left: `${5 + (i * 5.3) % 90}%`,
        animDuration: `${6 + (i % 7)}s`,
        animDelay: `${(i * 0.4) % 5}s`,
        opacity: 0.08 + (i % 5) * 0.04,
    }));

    const bgStyle = `
        @keyframes floatUp {
            0%   { transform: translateY(0) scale(1);   opacity: 0; }
            10%  { opacity: 1; }
            90%  { opacity: 1; }
            100% { transform: translateY(-100vh) scale(1.4); opacity: 0; }
        }
        @keyframes loginFadeIn {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .login-card { animation: loginFadeIn 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .login-particle { animation: floatUp linear infinite; }
        @keyframes orbPulse {
            0%,100% { transform: scale(1);   opacity: 0.12; }
            50%      { transform: scale(1.15); opacity: 0.22; }
        }
        .login-orb { animation: orbPulse ease-in-out infinite; }
    `;

    if (isCreateMode) {
        return (
            <div className="min-h-screen bg-[#07070e] flex items-center justify-center px-4 relative overflow-hidden">
                <style dangerouslySetInnerHTML={{ __html: bgStyle }} />
                {/* Animated orbs */}
                <div className="login-orb absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -top-32 -left-32" style={{ animationDuration: '8s' }} />
                <div className="login-orb absolute w-80 h-80 bg-purple-600/15 rounded-full blur-3xl -bottom-24 -right-24" style={{ animationDuration: '11s', animationDelay: '2s' }} />
                <div className="login-orb absolute w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '14s', animationDelay: '1s' }} />
                {/* Floating particles */}
                {particles.map(p => (
                    <div key={p.id} className="login-particle absolute bottom-0 rounded-full bg-blue-400"
                        style={{ width: p.size, height: p.size, left: p.left, animationDuration: p.animDuration, animationDelay: p.animDelay, opacity: p.opacity }} />
                ))}
                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="login-card relative z-10 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4 hover:scale-110 transition-transform"><Network className="text-white" size={32} /></div>
                        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Crear Perfil</h1>
                        <p className="text-gray-500 text-sm mt-1">Ingresá tus datos para registrarte</p>
                    </div>
                    <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-8 shadow-2xl">
                        <div className="flex justify-center mb-6">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700 cursor-pointer hover:border-blue-500 transition-all duration-300 group" onClick={() => fileInputRef.current?.click()}>
                                <img src={newAvatar} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full">
                                    <Camera size={22} className="text-white" />
                                </div>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </div>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre</label>
                                <input type="text" value={newName} onChange={(e) => { setNewName(e.target.value); setCreateError(''); }} placeholder="Ej: Federico" className="w-full bg-black/40 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                                <input type="email" value={newEmail} onChange={(e) => { setNewEmail(e.target.value); setCreateError(''); }} placeholder="federico@email.com" className="w-full bg-black/40 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Contraseña</label>
                                <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setCreateError(''); }} placeholder="Mínimo 4 caracteres" className="w-full bg-black/40 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Elegir avatar (opcional)</label>
                                <div className="grid grid-cols-5 gap-2">{avatarOptions.slice(0, 5).map((av, idx) => (<button key={idx} onClick={() => setNewAvatar(av)} type="button" className={`w-full aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${newAvatar === av ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/30' : 'border-transparent hover:border-gray-500'}`}><img src={av} alt="" className="w-full h-full object-cover" /></button>))}</div>
                            </div>
                            {createError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{createError}</p>}
                            <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-green-500/20 mt-2">Crear Perfil</button>
                        </form>
                        <button onClick={() => setIsCreateMode(false)} className="w-full mt-4 text-gray-500 hover:text-white text-sm py-2 transition-colors">← Volver al login</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-[#07070e] flex items-center justify-center px-4 relative overflow-hidden transition-opacity duration-300 ${loggingIn ? 'opacity-0' : 'opacity-100'}`}>
            <style dangerouslySetInnerHTML={{ __html: bgStyle }} />
            {/* Animated orbs */}
            <div className="login-orb absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -top-32 -left-32" style={{ animationDuration: '8s' }} />
            <div className="login-orb absolute w-80 h-80 bg-purple-600/15 rounded-full blur-3xl -bottom-24 -right-24" style={{ animationDuration: '11s', animationDelay: '2s' }} />
            <div className="login-orb absolute w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDuration: '14s', animationDelay: '1s' }} />
            {/* Floating particles */}
            {particles.map(p => (
                <div key={p.id} className="login-particle absolute bottom-0 rounded-full bg-blue-400"
                    style={{ width: p.size, height: p.size, left: p.left, animationDuration: p.animDuration, animationDelay: p.animDelay, opacity: p.opacity }} />
            ))}
            {/* Subtle grid */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            {/* Horizontal divider lines */}
            <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-1/3 h-px bg-gradient-to-r from-transparent via-purple-500/10 to-transparent pointer-events-none" />
            <div className="login-card relative z-10 w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4 hover:scale-110 transition-transform"><Network className="text-white" size={32} /></div>
                    <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">GraphRecs</h1>
                    <p className="text-gray-500 mt-2 text-sm">Motor de recomendación por grafos</p>
                </div>
                <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/60 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Iniciar Sesión</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                            <input type="email" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} placeholder="tu@email.com" className="w-full bg-black/40 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Contraseña</label>
                            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="••••" className="w-full bg-black/40 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all" />
                        </div>
                        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{error}</p>}
                        <button type="submit" disabled={loggingIn} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-60">
                            <Lock size={18} /> {loggingIn ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                    <div className="mt-4 pt-4 border-t border-gray-800">
                        <button onClick={() => setIsCreateMode(true)} className="w-full bg-gray-800/50 border border-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-700/60 hover:border-gray-600 transition-all">Crear Perfil</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SearchResultsView = ({ results, onItemClick, onAddToList, onLike, onRecommend, onRate, myListIds, likedIds }) => {
    if (results.length === 0) return null;
    return (<div className="animate-in fade-in duration-300"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">{results.map((item) => (<ContentCard key={item.id} item={item} onClick={onItemClick} onAddToList={onAddToList} onLike={onLike} onRecommend={onRecommend} onRate={onRate} inMyList={myListIds?.has(item.id)} isLiked={likedIds?.has(item.id)} />))}</div></div>);
};

const MyListView = ({ items, onItemClick, onRemove, onReorder }) => {
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const handleDragStart = (idx) => { dragItem.current = idx; };
    const handleDragEnter = (idx) => { dragOverItem.current = idx; };
    const handleDragEnd = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        if (dragItem.current === dragOverItem.current) return;
        const reordered = [...items];
        const [moved] = reordered.splice(dragItem.current, 1);
        reordered.splice(dragOverItem.current, 0, moved);
        onReorder?.(reordered);
        dragItem.current = null;
        dragOverItem.current = null;
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8"><h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3"><Bookmark className="text-blue-500" size={36} /> Mi Lista</h1><p className="text-gray-400">{items.length} {items.length === 1 ? 'ítem' : 'ítems'} guardados</p></div>
            {items.length === 0 ? (<div className="flex flex-col items-center justify-center py-20 text-gray-500"><Bookmark size={64} className="mb-4 opacity-30" /><p className="text-lg">Tu lista está vacía</p><p className="text-sm">Agrega contenido con el botón +</p></div>) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 py-4">
                    {items.map((item, idx) => (
                        <div
                            key={item.id}
                            className="group relative cursor-grab active:cursor-grabbing hover:scale-[1.03] transition-all duration-300"
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragEnter={() => handleDragEnter(idx)}
                            onDragEnd={handleDragEnd}
                            onDragOver={e => e.preventDefault()}
                        >
                            <div className="absolute top-2 left-2 z-30 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity">
                                <GripVertical size={16} />
                            </div>
                            <ContentCard item={item} onClick={onItemClick} />
                            <button onClick={() => onRemove(item.id)} className="absolute -top-2 -right-2 z-30 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"><X size={14} /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const LikedView = ({ items, onItemClick, onRemove }) => (
    <div className="animate-in fade-in duration-500">
        <div className="mb-8"><h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3"><Heart className="text-pink-500" size={36} /> Me Gusta</h1><p className="text-gray-400">{items.length} {items.length === 1 ? 'ítem' : 'ítems'} que te gustaron</p></div>
        {items.length === 0 ? (<div className="flex flex-col items-center justify-center py-20 text-gray-500"><Heart size={64} className="mb-4 opacity-30" /><p className="text-lg">Aún no diste like a nada</p><p className="text-sm">Dale like con el botón 👍</p></div>) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 py-4">
                {items.map((item) => (<div key={item.id} className="relative group hover:scale-[1.03] transition-all duration-300"><ContentCard item={item} onClick={onItemClick} /><button onClick={() => onRemove(item.id)} className="absolute -top-2 -right-2 z-30 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"><X size={14} /></button></div>))}
            </div>)}
    </div>
);

const RatedListView = ({ items, onItemClick }) => (
    <div className="animate-in fade-in duration-500">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Star className="text-yellow-400" size={36} fill="currentColor" /> Mis Calificaciones
            </h1>
            <p className="text-gray-400">{items.length} {items.length === 1 ? 'película/serie calificada' : 'películas/series calificadas'}</p>
        </div>
        {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Star size={64} className="mb-4 opacity-30" />
                <p className="text-lg">No calificaste nada aún</p>
                <p className="text-sm">Califica películas o series para verlas acá</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 py-4">
                {items.map((item) => (
                    <div key={item.id} className="relative group hover:scale-[1.03] transition-all duration-300">
                        {/* Golden rating badge over card */}
                        <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-black/85 border border-yellow-500/40 text-yellow-400 px-2.5 py-1 rounded-full text-xs font-black shadow-lg backdrop-blur-sm">
                            <Star size={12} fill="currentColor" /> {item.rating}
                        </div>
                        <ContentCard item={item} onClick={onItemClick} />
                    </div>
                ))}
            </div>
        )}
    </div>
);

const RecommendationsView = ({ recommendations, users, onItemClick, onAccept, onDismiss }) => (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3"><Share2 className="text-green-500" size={36} /> Recomendaciones</h1><p className="text-gray-400">{recommendations.length} recomendaciones de otros usuarios</p></div>
        {recommendations.length === 0 ? (<div className="flex flex-col items-center justify-center py-20 text-gray-500"><Share2 size={64} className="mb-4 opacity-30" /><p className="text-lg">No tenés recomendaciones aún</p><p className="text-sm">Cuando otro usuario te recomiende contenido aparecerá acá</p></div>) : (
            <div className="space-y-4">
                {recommendations.map((rec) => {
                    const fromUser = users.find(u => u.name === rec.from) || { name: rec.from, avatar: avatarOptions[0] };
                    return (
                        <div key={rec.id} className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors">
                            <div className="flex flex-col sm:flex-row">
                                <div className="relative flex-none w-full sm:w-40 h-48 sm:h-auto">
                                    <img src={rec?.item?.image || 'https://via.placeholder.com/150'} alt={rec?.item?.title || 'Contenido'} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-900/80 hidden sm:block"></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent sm:hidden"></div>
                                </div>
                                <div className="flex-1 p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <img src={fromUser.avatar} alt={fromUser.name} className="w-9 h-9 rounded-full border border-gray-700" />
                                            <div>
                                                <p className="text-white font-medium text-sm">{fromUser.name}</p>
                                                <p className="text-gray-500 text-xs">{timeAgo(rec.time)}</p>
                                            </div>
                                            <NeonBadge color="purple">Recomendación</NeonBadge>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1 cursor-pointer hover:text-blue-400 transition-colors" onClick={() => onItemClick(rec?.item)}>{rec?.item?.title || 'Contenido recomendado'}</h3>
                                        <p className="text-gray-400 text-sm mb-3">{rec?.item?.type || rec?.item?.artist || 'Desconocido'} · {rec?.item?.year || ''}</p>
                                        <p className="text-gray-300 text-sm italic">"{rec.message}"</p>
                                    </div>
                                    <div className="flex items-center gap-3 mt-5">
                                        <button onClick={() => rec?.item && onAccept?.(rec)} className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl hover:bg-blue-500/20 transition-colors text-sm font-medium"><Plus size={16} /> Agregar a Mi Lista</button>
                                        <button onClick={() => onDismiss?.(rec.id)} className="text-gray-500 hover:text-gray-300 p-2 hover:bg-gray-800 rounded-lg transition-colors"><X size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>)}
    </div>
);

const ActivityView = ({ currentEmail }) => {
    const [cals, setCals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getCalificaciones(currentEmail)
            .then(data => setCals(Array.isArray(data) ? data : []))
            .catch(() => setCals([]))
            .finally(() => setLoading(false));
    }, [currentEmail]);

    if (loading) return <div className="flex items-center justify-center py-24"><div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

    return (
        <div className="animate-in fade-in duration-500 max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3"><Activity className="text-blue-500" size={36} /> Actividad</h1>
                <p className="text-gray-400">{cals.length} calificaciones registradas</p>
            </div>
            {cals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Activity size={64} className="mb-4 opacity-30" />
                    <p className="text-lg">Sin actividad aún</p>
                    <p className="text-sm">Calificá contenido para verlo aquí</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {cals.map((c, i) => (
                        <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors">
                            {(c.imagen || c.contenido?.imagen) && (
                                <img src={c.imagen || c.contenido?.imagen} alt="" className="w-12 h-16 object-cover rounded-lg flex-none" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold truncate">
                                    Calificaste <span className="text-blue-400">{c.titulo || c.contenido?.titulo || 'contenido'}</span> con {c.puntuacion}/10 ⭐
                                </p>
                                <p className="text-gray-500 text-xs mt-0.5">{c.fecha || ''}</p>
                                {c.resena && <p className="text-gray-400 text-sm mt-1 italic line-clamp-2">"{c.resena}"</p>}
                            </div>
                            <div className="flex items-center gap-1 text-yellow-400 font-bold text-xl flex-none">
                                <Star size={18} fill="currentColor" />{c.puntuacion}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const RecommendModal = ({ item, onClose, users, currentEmail, onSend }) => {
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    if (!item) return null;

    const otherUsers = users.filter(u => u.email !== currentEmail);

    const toggleUser = (email) => {
        setSelectedUsers(prev => {
            const next = new Set(prev);
            next.has(email) ? next.delete(email) : next.add(email);
            return next;
        });
    };

    const handleSend = () => {
        if (selectedUsers.size === 0) return;
        onSend(item, [...selectedUsers], message);
        setSent(true);
        setTimeout(onClose, 1200);
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 pt-4 pb-20 sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative z-[300] w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2"><Send size={20} className="text-blue-400" /> Recomendar</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded-lg transition-colors"><X size={20} /></button>
                </div>
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-5 bg-gray-800/50 rounded-xl p-3">
                        <img src={item.image} alt={item.title} className="w-12 h-16 rounded-lg object-cover" />
                        <div><p className="text-white font-bold">{item.title}</p><p className="text-gray-400 text-sm">{item.type || item.artist} · {item.year}</p></div>
                    </div>
                    {sent ? (
                        <div className="text-center py-8">
                            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Send size={28} className="text-green-400" /></div>
                            <p className="text-green-400 font-bold text-lg">¡Enviado!</p>
                            <p className="text-gray-400 text-sm">Recomendación enviada a {selectedUsers.size} {selectedUsers.size === 1 ? 'usuario' : 'usuarios'}</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-gray-400 mb-3">Seleccioná usuarios para recomendar:</p>
                            {otherUsers.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">No hay otros usuarios registrados aún</p>
                            ) : (
                                <div className="space-y-2 mb-5 max-h-48 overflow-y-auto">
                                    {otherUsers.map(u => {
                                        const isSelected = selectedUsers.has(u.email);
                                        return (
                                            <button key={u.email} onClick={() => toggleUser(u.email)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isSelected ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-gray-800/30 border border-gray-800 hover:bg-gray-800/60'}`}>
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {(u.nombre || u.email)[0].toUpperCase()}
                                                </div>
                                                <div className="flex-1 text-left"><p className="text-white text-sm font-medium">{u.nombre || u.email}</p><p className="text-gray-500 text-xs">{u.email}</p></div>
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>{isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Agregá un mensaje (opcional)" className="w-full bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all mb-4" />
                            <button onClick={handleSend} disabled={selectedUsers.size === 0} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${selectedUsers.size > 0 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}><Send size={18} /> Enviar recomendación</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!session.get());
    const [currentUser, setCurrentUser] = useState(() => session.get());
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [ratingItem, setRatingItem] = useState(null);
    const [recommendItem, setRecommendItem] = useState(null);
    const [recommendUsers, setRecommendUsers] = useState([]);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [myList, setMyList] = useState([]);
    const [liked, setLiked] = useState([]);
    const [ratedList, setRatedList] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingHome, setLoadingHome] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const [genreFilter, setGenreFilter] = useState('');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
    const [viewMode, setViewMode] = useState('grid');
    const [featuredIndex, setFeaturedIndex] = useState(0);
    const refreshRatings = useCallback(() => {
        if (currentUser?.email) {
            api.getCalificaciones(currentUser.email)
                .then(cals => setRatedList(Array.isArray(cals) ? cals : []))
                .catch(console.error);
        }
    }, [currentUser?.email]);

    // Cargar datos al loguear
    useEffect(() => {
        if (!isLoggedIn || !currentUser) return;
        const email = currentUser.email;
        setLoadingHome(true);
        Promise.all([
            api.getMovies(),
            api.getSeries(),
            api.getGuardados(email),
            api.getLikes(email),
            api.getRecommendations(email),
            api.getManualRecommendations(email),
            api.getCalificaciones(email),
        ]).then(([movs, sers, guard, liks, recs, manualRecs, cals]) => {
            setMovies(movs);
            setSeries(sers);
            setMyList(guard);
            setLiked(liks);
            setRatedList(Array.isArray(cals) ? cals : []);
            const merged = [
                ...recs,
                ...manualRecs.map(r => ({
                    contenido: r.contenido,
                    recomienda: r.recomienda,
                    recomiendaEmail: r.recomiendaEmail,
                    puntuacion: null,
                    resena: r.mensaje || '',
                    mensaje: r.mensaje || '',
                    fecha: r.fecha,
                    esManual: true,
                })),
            ];
            setRecommendations(merged);
        }).catch(console.error)
          .finally(() => setLoadingHome(false));
    }, [isLoggedIn, currentUser?.email]);

    // Busqueda en tiempo real
    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        const q = searchQuery.toLowerCase();
        const all = [
            ...movies.map(m => ({ ...m, title: m.titulo, year: m.anio, image: m.imagen, genres: m.generos, type: 'Pelicula', match: null })),
            ...series.map(s => ({ ...s, title: s.titulo, year: s.anio, image: s.imagen, genres: s.generos, type: 'Serie', match: null })),
        ];
        setSearchResults(all.filter(i =>
            i.title?.toLowerCase().includes(q) ||
            i.genres?.some(g => g.toLowerCase().includes(q))
        ));
    }, [searchQuery, movies, series]);

    const mapMovie = (m) => ({ id: m.id, title: m.titulo, year: m.anio, image: m.imagen, genres: m.generos || [], type: 'Pelicula', match: null, description: '' });
    const mapSerie = (s) => ({ id: s.id, title: s.titulo, year: s.anio, image: s.imagen, genres: s.generos || [], type: 'Serie', match: null, description: '' });
    const mapRec = (r) => ({ id: r?.contenido?.id, title: r?.contenido?.titulo, year: r?.contenido?.anio, image: r?.contenido?.imagen, genres: r?.contenido?.generos || [], type: r?.contenido?.tipo, match: r?.puntuacion, description: r?.resena || '' });

    const moviesUI = movies.map(mapMovie);
    const seriesUI = series.map(mapSerie);
    const recsUI = recommendations.map(mapRec);

    const myListIds = new Set(myList.map(i => i.id));
    const likedIds = new Set(liked.map(i => i.id));

    const toggleMyList = async (item) => {
        if (!currentUser) return;
        try {
            if (myListIds.has(item.id)) {
                await api.quitarGuardado(currentUser.email, item.id);
                setMyList(prev => prev.filter(i => i.id !== item.id));
            } else {
                await api.guardar(currentUser.email, item.id);
                setMyList(prev => [...prev, { id: item.id, titulo: item.title, imagen: item.image, anio: item.year }]);
            }
        } catch (e) { console.error(e); }
    };

    const toggleLike = async (item) => {
        if (!currentUser) return;
        try {
            if (likedIds.has(item.id)) {
                await api.quitarLike(currentUser.email, item.id);
                setLiked(prev => prev.filter(i => i.id !== item.id));
            } else {
                await api.like(currentUser.email, item.id);
                setLiked(prev => [...prev, { id: item.id, titulo: item.title, imagen: item.image, anio: item.year }]);
            }
        } catch (e) { console.error(e); }
    };

    const handleRecommend = async (item, toEmails, message) => {
        if (!currentUser || !item) return;
        try {
            await Promise.all(toEmails.map(toEmail =>
                api.sendRecommendation(currentUser.email, toEmail, String(item.id), item.type, message)
            ));
        } catch (e) { console.error(e); }
    };

    // Fetch all users when recommend modal opens
    useEffect(() => {
        if (recommendItem) {
            api.getAllUsers().then(setRecommendUsers).catch(() => {});
        }
    }, [recommendItem]);

    const handleLogout = () => {
        session.clear();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setActiveTab('home');
    };

    const updateProfile = async (nombre, pais) => {
        if (!currentUser) return;
        try {
            await api.updateUser(currentUser.email, nombre, pais);
            const updated = { ...currentUser, nombre, name: nombre };
            setCurrentUser(updated);
            session.set(updated);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const featuredItems = React.useMemo(() => {
        const list = [];
        const len = Math.max(moviesUI.length, seriesUI.length);
        for (let i = 0; i < len; i++) {
            if (moviesUI[i]) list.push(moviesUI[i]);
            if (seriesUI[i]) list.push(seriesUI[i]);
            if (list.length >= 5) break;
        }
        return list;
    }, [moviesUI, seriesUI]);

    useEffect(() => {
        if (featuredItems.length <= 1) return;
        const timer = setInterval(() => {
            setFeaturedIndex(prev => (prev + 1) % featuredItems.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [featuredItems.length]);

    const navItems = [
        { id: 'home', icon: Home, label: 'Inicio' },
        { id: 'mylist', icon: Bookmark, label: 'Mi Lista', count: myList.length },
        { id: 'liked', icon: Heart, label: 'Me Gusta', count: liked.length },
        { id: 'ratings', icon: Star, label: 'Calificadas', count: ratedList.length },
        { id: 'recommendations', icon: Share2, label: 'Recomendaciones', count: recommendations.length },
        { id: 'friends', icon: Users, label: 'Amigos' },
        { id: 'activity', icon: Activity, label: 'Actividad' },
        { id: 'graph', icon: Network, label: 'Descubrir' },
        { id: 'profile', icon: User, label: 'Perfil' },
    ];

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('theme', next ? 'dark' : 'light');
            return next;
        });
    };

    if (!isLoggedIn && !isTransitioning) {
        return (
            <LoginView 
                onLogin={() => {
                    setIsTransitioning(true);
                }} 
                onUserChange={(user) => {
                    setPendingUser(user);
                }} 
            />
        );
    }

    return (
        <div className={`min-h-screen bg-[#07070d] text-gray-100 font-sans selection:bg-blue-500/30 ${darkMode ? '' : 'light-mode'}`}>
            {/* Animated particle dots background */}
            <canvas
                id="app-particles"
                className="fixed inset-0 pointer-events-none z-0"
                style={{ width: '100%', height: '100%' }}
                ref={el => {
                    if (!el || el._init) return;
                    el._init = true;
                    const canvas = el;
                    const ctx = canvas.getContext('2d');
                    let W, H, particles, raf;
                    const resize = () => {
                        W = canvas.width = window.innerWidth;
                        H = canvas.height = window.innerHeight;
                    };
                    const init = () => {
                        resize();
                        particles = Array.from({ length: 80 }, () => ({
                            x: Math.random() * W, y: Math.random() * H,
                            r: Math.random() * 1.5 + 0.4,
                            dx: (Math.random() - 0.5) * 0.3,
                            dy: (Math.random() - 0.5) * 0.3,
                            o: Math.random() * 0.4 + 0.1,
                            c: ['#3b82f6','#8b5cf6','#6366f1','#a78bfa'][Math.floor(Math.random()*4)]
                        }));
                    };
                    const draw = () => {
                        ctx.clearRect(0, 0, W, H);
                        particles.forEach(p => {
                            p.x += p.dx; p.y += p.dy;
                            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                            ctx.fillStyle = p.c;
                            ctx.globalAlpha = p.o;
                            ctx.fill();
                        });
                        ctx.globalAlpha = 1;
                        raf = requestAnimationFrame(draw);
                    };
                    init(); draw();
                    window.addEventListener('resize', resize);
                }}
            />
            {/* Aurora blobs */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06] blur-3xl bg-blue-600" style={{ top: '-10%', left: '-5%', animation: 'auroraA 18s ease-in-out infinite alternate' }} />
                <div className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05] blur-3xl bg-purple-700" style={{ top: '30%', right: '-10%', animation: 'auroraB 22s ease-in-out infinite alternate' }} />
                <div className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04] blur-3xl bg-indigo-500" style={{ bottom: '0%', left: '20%', animation: 'auroraC 26s ease-in-out infinite alternate' }} />
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes auroraA { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(60px,-40px) scale(1.1)} 100%{transform:translate(-30px,60px) scale(0.95)} }
                @keyframes auroraB { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-70px,50px) scale(1.15)} 100%{transform:translate(40px,-30px) scale(0.9)} }
                @keyframes auroraC { 0%{transform:translate(0,0) scale(1)} 50%{transform:translate(50px,30px) scale(1.08)} 100%{transform:translate(-60px,-50px) scale(1.05)} }
                .light-mode { background: #f3f4f6 !important; color: #111827 !important; }
                .light-mode .bg-gray-900\/60, .light-mode .bg-gray-900\/40 { background: rgba(255,255,255,0.8) !important; }
                .light-mode .border-gray-800 { border-color: #e5e7eb !important; }
                .light-mode .text-gray-400 { color: #4b5563 !important; }
                .light-mode .text-gray-300 { color: #374151 !important; }
                .light-mode .text-white { color: #111827 !important; }
                .light-mode .bg-\[\#07070d\] { background: #f3f4f6 !important; }
            `}} />

            <aside
                className="fixed top-0 left-0 h-screen bg-black/60 backdrop-blur-xl border-r border-gray-800/50 hidden md:flex flex-col z-50 overflow-hidden"
                style={{ width: sidebarExpanded ? '16rem' : '5rem', transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)' }}
                onMouseEnter={() => setSidebarExpanded(true)}
                onMouseLeave={() => setSidebarExpanded(false)}
            >
                <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarExpanded ? 'px-6 py-5' : 'p-4 justify-center'}`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0"><Network className="text-white" size={20} /></div>
                    <span className={`text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 transition-all duration-300 whitespace-nowrap ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>GraphRecs</span>
                </div>
                <nav className="flex-1 px-3 space-y-2 overflow-hidden">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap ${activeTab === item.id ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                            <item.icon size={22} className={`transition-transform duration-200 group-hover:scale-110 flex-shrink-0 ${activeTab === item.id ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
                            <span className={`font-medium flex-1 text-left transition-all duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                            {item.count !== undefined && item.count > 0 && (<span className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'} ${activeTab === item.id ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-800 text-gray-400'}`}>{item.count}</span>)}
                        </button>
                    ))}
                </nav>
                <div className="px-3 pb-3 space-y-2">
                    <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap text-gray-400 hover:text-white hover:bg-white/5 border border-transparent`}>
                        <img src={currentUser?.avatar || avatarOptions[0]} alt="User" className="w-[22px] h-[22px] rounded-full border border-gray-700 flex-shrink-0" />
                        <span className={`font-medium flex-1 text-left transition-all duration-300 whitespace-nowrap ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                            {currentUser?.name}
                            <span className="block text-xs text-green-400 font-normal"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-1"></span>En línea</span>
                        </span>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group whitespace-nowrap text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent">
                        <LogOut size={22} className="flex-shrink-0" />
                        <span className={`font-medium transition-all duration-300 whitespace-nowrap ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            <div className="md:hidden fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-lg border-t border-gray-800 z-50 px-2 py-2 flex justify-between items-center pb-safe overflow-x-auto">
                {navItems.slice(0, 6).map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 min-w-0 px-2 ${activeTab === item.id ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
                        <div className="relative"><item.icon size={22} />{item.count !== undefined && item.count > 0 && (<span className="absolute -top-1 -right-2 bg-blue-500 text-white text-[8px] px-1 rounded-full">{item.count}</span>)}</div>
                        <span className="text-[9px] font-medium">{item.label}</span>
                    </button>
                ))}
            </div>

            <main className="min-h-screen relative z-10 pb-24 md:pb-0 md:ml-20">
                <header className={`sticky top-0 w-full z-30 transition-colors duration-300 px-6 py-4 flex items-center justify-between gap-4 border-b ${scrolled ? 'bg-black/70 backdrop-blur-md border-gray-800/50 scrolled-header' : 'bg-transparent border-transparent'}`}>
                    <div className="md:hidden flex items-center gap-2 flex-shrink-0"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><Network className="text-white" size={18} /></div></div>
                    <div className="flex-1 flex justify-center">
                        <div className="relative w-full max-w-lg group hidden sm:block">
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value.trim() && activeTab === 'home') setActiveTab('search'); if (!e.target.value.trim() && activeTab === 'search') setActiveTab('home'); }} placeholder="Buscar películas, series, géneros..." className="w-full bg-gray-900/60 border border-gray-700/50 text-white placeholder-gray-600 rounded-2xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all backdrop-blur-sm text-sm" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button className="text-gray-400 hover:text-white sm:hidden"><Search size={22} /></button>
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700 transition-all border border-gray-700"
                            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </header>

                <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto pt-6" style={{ overflow: 'visible' }}>
                    {activeTab === 'home' && (
                        <div className="animate-in fade-in duration-500">
                            {loadingHome ? (
                                <div className="flex items-center justify-center py-24"><div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
                            ) : (
                              <>
                                {featuredItems.length > 0 && (
                                    <div className="relative rounded-3xl overflow-hidden mb-12 h-72 md:h-[400px] group shadow-2xl border border-gray-800/30">
                                        {/* Slides Wrapper */}
                                        {featuredItems.map((item, idx) => {
                                            const isActive = idx === featuredIndex;
                                            return (
                                                <div 
                                                    key={item.id} 
                                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                                        isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                                                    }`}
                                                >
                                                    {/* Background overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent z-10" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent z-10" />
                                                    
                                                    {/* Banner Image */}
                                                    <img 
                                                        src={item.image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop'} 
                                                        alt={item.title} 
                                                        className={`w-full h-full object-cover transform transition-transform duration-[8000ms] ease-out ${
                                                            isActive ? 'scale-105' : 'scale-100'
                                                        }`} 
                                                    />
                                                    
                                                    {/* Content Overlay */}
                                                    <div className="absolute bottom-0 left-0 p-8 md:p-14 z-20 w-full md:w-2/3 text-left">
                                                        <div className="flex gap-2 mb-3">
                                                            <NeonBadge color="blue">Recomendado por Neo4j</NeonBadge>
                                                            <NeonBadge color="purple">{item.type}</NeonBadge>
                                                        </div>
                                                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight leading-tight">
                                                            {item.title}
                                                        </h1>
                                                        <div className="flex gap-4">
                                                            <button 
                                                                className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 hover:scale-105 transition-all text-sm md:text-base shadow-lg" 
                                                                onClick={() => setSelectedItem(item)}
                                                            >
                                                                <Play fill="currentColor" size={20} /> Ver Detalle
                                                            </button>
                                                            <button 
                                                                className="bg-gray-800/80 text-white backdrop-blur-md px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-700 transition-all border border-gray-600 text-sm md:text-base shadow-lg" 
                                                                onClick={() => setRatingItem(item)}
                                                            >
                                                                <Star size={20} /> Calificar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Prev / Next controls */}
                                        {featuredItems.length > 1 && (
                                            <>
                                                <button 
                                                    onClick={() => setFeaturedIndex(prev => (prev - 1 + featuredItems.length) % featuredItems.length)}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button 
                                                    onClick={() => setFeaturedIndex(prev => (prev + 1) % featuredItems.length)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                                >
                                                    <ChevronRight size={24} />
                                                </button>
                                            </>
                                        )}

                                        {/* Dot Indicators */}
                                        {featuredItems.length > 1 && (
                                            <div className="absolute bottom-5 right-8 z-20 flex gap-2">
                                                {featuredItems.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setFeaturedIndex(idx)}
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                                            idx === featuredIndex ? 'w-6 bg-blue-500' : 'w-1.5 bg-gray-500 hover:bg-gray-400'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* Filtro por género */}
                                {(() => {
                                    const allGenres = [...new Set([
                                        ...moviesUI.flatMap(m => m.genres || []),
                                        ...seriesUI.flatMap(s => s.genres || []),
                                    ])].sort();
                                    const filteredMovies = genreFilter ? moviesUI.filter(m => (m.genres || []).includes(genreFilter)) : moviesUI;
                                    const filteredSeries = genreFilter ? seriesUI.filter(s => (s.genres || []).includes(genreFilter)) : seriesUI;
                                    return (
                                        <>
                                            {allGenres.length > 0 && (
                                                <div className="mb-8">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Filtrar por género</p>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setViewMode('grid')}
                                                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-white'}`}
                                                                title="Vista cuadrícula"
                                                            >
                                                                <LayoutGrid size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setViewMode('list')}
                                                                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-white'}`}
                                                                title="Vista lista"
                                                            >
                                                                <List size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() => setGenreFilter('')}
                                                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                                                genreFilter === ''
                                                                    ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                                    : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                                                            }`}
                                                        >Todos</button>
                                                        {allGenres.map(g => (
                                                            <button
                                                                key={g}
                                                                onClick={() => setGenreFilter(g === genreFilter ? '' : g)}
                                                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                                                    genreFilter === g
                                                                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                                        : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                                                                }`}
                                                            >{g}</button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {viewMode === 'grid' ? (
                                                <>
                                                    {filteredMovies.length > 0 && <Carousel title={genreFilter ? `Películas · ${genreFilter}` : 'Películas'} subtitle="Catálogo completo" icon={Network} items={filteredMovies} onCardClick={setSelectedItem} onAddToList={toggleMyList} onLike={toggleLike} onRecommend={setRecommendItem} onRate={setRatingItem} myListIds={myListIds} likedIds={likedIds} />}
                                                    {filteredSeries.length > 0 && <Carousel title={genreFilter ? `Series · ${genreFilter}` : 'Series'} subtitle="Catálogo completo" icon={Activity} items={filteredSeries} onCardClick={setSelectedItem} onAddToList={toggleMyList} onLike={toggleLike} onRecommend={setRecommendItem} onRate={setRatingItem} myListIds={myListIds} likedIds={likedIds} />}
                                                    {!genreFilter && recsUI.length > 0 && <Carousel title="Recomendado por tus amigos" subtitle="Filtrado colaborativo" icon={Share2} items={recsUI} onCardClick={setSelectedItem} onAddToList={toggleMyList} onLike={toggleLike} onRecommend={setRecommendItem} onRate={setRatingItem} myListIds={myListIds} likedIds={likedIds} />}
                                                </>
                                            ) : (
                                                <div className="space-y-3">
                                                    {[...filteredMovies, ...filteredSeries].map(item => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors cursor-pointer"
                                                            onClick={() => setSelectedItem(item)}
                                                        >
                                                            <img src={item.image} alt={item.title} className="w-[45px] h-[60px] object-cover rounded-lg flex-none" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white font-bold truncate">{item.title}</p>
                                                                <p className="text-gray-400 text-xs">{item.type} · {item.year}</p>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {(item.genres || []).slice(0, 2).map(g => <span key={g} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full text-xs">{g}</span>)}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <button
                                                                    className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all"
                                                                    onClick={e => { e.stopPropagation(); toggleMyList(item); }}
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                                <button
                                                                    className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-all"
                                                                    onClick={e => { e.stopPropagation(); setRecommendItem(item); }}
                                                                    title="Recomendar"
                                                                >
                                                                    <Share2 size={12} />
                                                                </button>
                                                                <button
                                                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400/15 border border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/30 transition-all text-xs font-bold"
                                                                    onClick={e => { e.stopPropagation(); setRatingItem(item); }}
                                                                >
                                                                    <Star size={11} fill="currentColor" /> Calificar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {filteredMovies.length === 0 && filteredSeries.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-20 text-gray-500"><Database size={56} className="mb-4 opacity-30" /><p className="text-lg">{genreFilter ? `Sin contenido en el género "${genreFilter}"` : 'No hay contenido en la base de datos'}</p>{!genreFilter && <p className="text-sm mt-1">Ejecutá el seed para cargar datos</p>}</div>
                                            )}
                                        </>
                                    );
                                })()}
                              </>
                            )}
                        </div>
                    )}
                    {activeTab === 'search' && (searchResults.length > 0 ? (<SearchResultsView results={searchResults} onItemClick={setSelectedItem} onAddToList={toggleMyList} onLike={toggleLike} onRecommend={setRecommendItem} onRate={setRatingItem} myListIds={myListIds} likedIds={likedIds} />) : (<div className="flex flex-col items-center justify-center py-20 text-gray-500"><Search size={64} className="mb-4 opacity-30" /><p className="text-lg">No se encontraron resultados para "{searchQuery}"</p></div>))}
                    {activeTab === 'mylist' && <MyListView items={myList.map(i => ({ id: i.id, title: i.titulo, image: i.imagen, year: i.anio, genres: [], type: 'Contenido' }))} onItemClick={setSelectedItem} onRemove={(id) => toggleMyList({ id })} onReorder={(reordered) => setMyList(reordered.map(i => ({ id: i.id, titulo: i.title, imagen: i.image, anio: i.year })))} />}
                    {activeTab === 'liked' && <LikedView items={liked.map(i => ({ id: i.id, title: i.titulo, image: i.imagen, year: i.anio, genres: [], type: 'Contenido' }))} onItemClick={setSelectedItem} onRemove={(id) => toggleLike({ id })} />}
                    {activeTab === 'ratings' && (
                        <RatedListView 
                            items={ratedList.map(c => ({
                                id: c.id || c.contenido?.id,
                                title: c.titulo || c.contenido?.titulo || 'Contenido',
                                image: c.imagen || c.contenido?.imagen || '',
                                year: c.anio || c.contenido?.anio || '',
                                rating: c.puntuacion,
                                genres: [],
                                type: c.tipo || c.contenido?.tipo || 'Contenido'
                            }))} 
                            onItemClick={setSelectedItem} 
                        />
                    )}
                    {activeTab === 'recommendations' && <RecommendationsView recommendations={recsUI.map((r, i) => ({ id: i, item: r, from: recommendations[i]?.recomienda || '?', message: recommendations[i]?.resena || '', time: recommendations[i]?.fecha || new Date().toISOString() }))} users={[]} onItemClick={setSelectedItem} onAccept={(rec) => toggleMyList(rec.item)} onDismiss={() => {}} />}
                    {activeTab === 'friends' && currentUser && <FriendsView currentEmail={currentUser.email} />}
                    {activeTab === 'activity' && currentUser && <ActivityView currentEmail={currentUser.email} />}
                    {activeTab === 'graph' && currentUser && <GraphDashboard currentUser={currentUser} onItemClick={setSelectedItem} />}
                    {activeTab === 'profile' && currentUser && <ProfileView onLogout={handleLogout} currentUser={{ ...currentUser, name: currentUser.nombre || currentUser.name || currentUser.email }} onUpdateProfile={updateProfile} />}
                </div>
            </main>

            {ratingItem && currentUser && (<RatingModal item={{ id: ratingItem.id, titulo: ratingItem.title, tipo: ratingItem.type, anio: ratingItem.year, imagen: ratingItem.image }} currentEmail={currentUser.email} onClose={() => setRatingItem(null)} onSuccess={refreshRatings} />)}

            {recommendItem && currentUser && (
                <RecommendModal
                    item={recommendItem}
                    onClose={() => setRecommendItem(null)}
                    users={recommendUsers}
                    currentEmail={currentUser.email}
                    onSend={handleRecommend}
                />
            )}

            {selectedItem && (
                <DetailPage 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)} 
                    currentEmail={currentUser?.email} 
                    onAddToList={toggleMyList}
                    onLike={toggleLike}
                    onRecommend={setRecommendItem}
                    onRate={setRatingItem}
                    myListIds={myListIds}
                    likedIds={likedIds}
                    userRating={ratedList.find(r => String(r.id || r.contenido?.id) === String(selectedItem.id))?.puntuacion}
                />
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                button, [role="button"] { cursor: pointer !important; }
                select { cursor: pointer !important; }
                a { cursor: pointer !important; }
            `}} />
            <style dangerouslySetInnerHTML={{ __html: `
                /* ── Light mode complete overhaul ── */
                .light-mode,
                .light-mode main {
                    background-color: #f1f5f9 !important;
                    color: #1e293b !important;
                }
                /* Sidebar */
                .light-mode aside {
                    background: rgba(255,255,255,0.95) !important;
                    border-color: #cbd5e1 !important;
                }
                .light-mode aside button,
                .light-mode aside span,
                .light-mode aside svg {
                    color: #475569 !important;
                }
                .light-mode aside button:hover {
                    background: rgba(0,0,0,0.05) !important;
                    color: #0f172a !important;
                }
                .light-mode aside button.text-blue-400 { color: #2563eb !important; }
                /* Header */
                .light-mode header {
                    background: transparent !important;
                    border-color: transparent !important;
                }
                .light-mode header.scrolled-header {
                    background: rgba(241,245,249,0.9) !important;
                    border-color: #cbd5e1 !important;
                }
                /* Search bar */
                .light-mode header input {
                    background: #ffffff !important;
                    border-color: #cbd5e1 !important;
                    color: #1e293b !important;
                }
                .light-mode header svg { color: #64748b !important; }
                /* Dark/light toggle button */
                .light-mode header button {
                    background: rgba(0,0,0,0.06) !important;
                    border-color: #cbd5e1 !important;
                    color: #475569 !important;
                }
                /* Canvas particles — hide in light mode */
                .light-mode canvas#app-particles { opacity: 0.15 !important; }
                /* Aurora blobs — very subtle */
                .light-mode .fixed.inset-0.pointer-events-none.z-0 { opacity: 0.3 !important; }
                /* All gray card backgrounds */
                .light-mode [class*="bg-gray-900"],
                .light-mode [class*="bg-gray-800"] {
                    background-color: #ffffff !important;
                    border-color: #e2e8f0 !important;
                }
                /* Text colors */
                .light-mode .text-white { color: #1e293b !important; }
                .light-mode .text-gray-100 { color: #1e293b !important; }
                .light-mode .text-gray-200 { color: #334155 !important; }
                .light-mode .text-gray-300 { color: #475569 !important; }
                .light-mode .text-gray-400 { color: #64748b !important; }
                .light-mode .text-gray-500 { color: #94a3b8 !important; }
                /* Borders */
                .light-mode [class*="border-gray-800"] { border-color: #e2e8f0 !important; }
                .light-mode [class*="border-gray-700"] { border-color: #cbd5e1 !important; }
                /* Genre chips - inactive */
                .light-mode [class*="bg-gray-800/60"] {
                    background: #ffffff !important;
                    border-color: #cbd5e1 !important;
                    color: #475569 !important;
                }
                /* Main content bg */
                .light-mode [class*="bg-\\[\\#07070d\\]"] { background-color: #f1f5f9 !important; }
                /* White/10 buttons */
                .light-mode [class*="bg-white/10"] { background: rgba(0,0,0,0.07) !important; }
                .light-mode [class*="bg-white/5"] { background: rgba(0,0,0,0.04) !important; }
                .light-mode [class*="border-white/10"] { border-color: #cbd5e1 !important; }
                /* Blue badge counts in sidebar */
                .light-mode .bg-gray-800.text-gray-400 { background: #e2e8f0 !important; color: #64748b !important; }
                /* Subtitle section labels */
                .light-mode .text-blue-400 { color: #2563eb !important; }
                /* List view rows */
                .light-mode [class*="bg-gray-900/60"] {
                    background: #ffffff !important;
                    border-color: #e2e8f0 !important;
                }
                /* Profile/stats cards */
                .light-mode [class*="bg-gray-900/40"] { background: #ffffff !important; }
                .light-mode [class*="bg-black/40"] { background: rgba(0,0,0,0.04) !important; }
                .light-mode [class*="bg-black/60"] { background: rgba(0,0,0,0.06) !important; }
                /* Carousel section title */
                .light-mode h2 { color: #0f172a !important; }
                .light-mode p { color: inherit; }
                /* Carousel nav buttons */
                .light-mode [class*="bg-gray-800/80"] {
                    background: #ffffff !important;
                    border-color: #cbd5e1 !important;
                    color: #475569 !important;
                }
                /* Bottom mobile nav */
                .light-mode [class*="bg-black/80"] {
                    background: rgba(255,255,255,0.95) !important;
                    border-color: #e2e8f0 !important;
                }
            `}} />
            {isTransitioning && (
                <CinematicTransition 
                    onComplete={() => {
                        if (pendingUser) {
                            setCurrentUser(pendingUser);
                        }
                        setIsLoggedIn(true);
                    }} 
                    onEnded={() => {
                        setIsTransitioning(false);
                    }}
                />
            )}

        </div>
    );
}
