import { useEffect, useMemo, useState } from 'react'
import { Heart, X, Dog, Cat, MapPin, Filter, MessageSquare, Sparkles, Plus, BadgeCheck, Send, Megaphone } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

// Minimal client-side store for demo
function useApi() {
  const base = API_BASE
  const j = (r) => r.json()
  const post = (url, body) => fetch(`${base}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(j)
  const get = (url) => fetch(`${base}${url}`).then(j)
  return { post, get }
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-full border text-sm transition ${active ? 'bg-emerald-100 border-emerald-300 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
      {children}
    </button>
  )
}

function Toolbar({ species, setSpecies, onOpenNew, onOpenFilters }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-2">
        <Pill active={species==='dog'} onClick={()=>setSpecies('dog')}><Dog className="inline h-4 w-4 mr-1"/>Dogs</Pill>
        <Pill active={species==='cat'} onClick={()=>setSpecies('cat')}><Cat className="inline h-4 w-4 mr-1"/>Cats</Pill>
      </div>
      <div className="flex gap-2">
        <button onClick={onOpenFilters} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"><Filter size={16}/>Filters</button>
        <button onClick={onOpenNew} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"><Plus size={16}/>Add Pet</button>
      </div>
    </div>
  )
}

function SwipeCard({ pet, onLike, onPass }) {
  return (
    <div className="relative bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="aspect-[4/5] bg-gray-100">
        {pet.photos?.length ? (
          <img src={pet.photos[0]} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No photo</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-800">{pet.name} • {pet.age}</div>
            <div className="text-sm text-gray-500">{pet.breed} • {pet.gender}</div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin size={14}/>{pet.city || 'Unknown'}</div>
          </div>
          {pet.verified && <BadgeCheck className="text-emerald-500"/>}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(pet.personality||[]).slice(0,4).map((t, i)=> (
            <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">{t}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <button onClick={onPass} className="h-12 w-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"><X/></button>
          <button onClick={onLike} className="h-14 w-14 flex items-center justify-center rounded-full bg-rose-500 text-white shadow hover:bg-rose-600"><Heart/></button>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ matches, onOpenChat, announcements }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2"><Sparkles size={18}/> Matches</div>
        <div className="space-y-2">
          {matches.map(m => (
            <button key={m.id} onClick={()=>onOpenChat(m)} className="w-full flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-100 hover:bg-gray-50">
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">❤</div>
              <div className="text-left text-sm">
                <div className="font-medium text-gray-800">Match</div>
                <div className="text-gray-500">Tap to chat</div>
              </div>
            </button>
          ))}
          {!matches.length && <div className="text-sm text-gray-500">No matches yet</div>}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2"><Megaphone size={18}/> Announcements</div>
        <div className="space-y-2">
          {announcements.map(a => (
            <div key={a.id} className="p-3 rounded-lg bg-white border border-gray-100">
              <div className="font-medium text-gray-800">{a.title}</div>
              <div className="text-sm text-gray-500">{a.description}</div>
            </div>
          ))}
          {!announcements.length && <div className="text-sm text-gray-500">No announcements</div>}
        </div>
      </div>
    </div>
  )
}

function ChatDrawer({ open, onClose, match, api }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  useEffect(()=>{
    if (!match) return
    api.get(`/messages/${match.id}`).then(setMessages)
  }, [match])

  const send = async () => {
    if (!text.trim()) return
    await api.post('/messages', { match_id: match.id, sender_pet_id: match.pet_a_id, sender_owner_id: match.owner_a_id, text })
    setText('')
    const m = await api.get(`/messages/${match.id}`)
    setMessages(m)
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex">
      <div className="ml-auto w-full max-w-md h-full bg-white flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700"><MessageSquare/> Chat</div>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100">Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map(m => (
            <div key={m.id} className="max-w-[80%] rounded-lg px-3 py-2 bg-emerald-50 text-emerald-800">{m.text}</div>
          ))}
        </div>
        <div className="p-3 border-t flex gap-2">
          <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type a message" className="flex-1 border rounded-lg px-3 py-2"/>
          <button onClick={send} className="px-3 py-2 rounded-lg bg-emerald-500 text-white flex items-center gap-1"><Send size={16}/>Send</button>
        </div>
      </div>
    </div>
  )
}

function AddPetModal({ open, onClose, onCreate, ownerId, species }) {
  const [form, setForm] = useState({ species, name:'', breed:'', age:1, gender:'male', pedigree:false, city:'', personality:'' })
  useEffect(()=>{ setForm(f=>({ ...f, species })) }, [species])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl p-5 space-y-3">
        <div className="text-lg font-semibold text-gray-800">Add Pet</div>
        <div className="grid grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          <input className="border rounded px-3 py-2" placeholder="Breed" value={form.breed} onChange={e=>setForm({...form, breed:e.target.value})}/>
          <input className="border rounded px-3 py-2" type="number" placeholder="Age" value={form.age} onChange={e=>setForm({...form, age:Number(e.target.value)})}/>
          <select className="border rounded px-3 py-2" value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input className="border rounded px-3 py-2 col-span-2" placeholder="City" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}/>
          <label className="flex items-center gap-2 text-sm col-span-2"><input type="checkbox" checked={form.pedigree} onChange={e=>setForm({...form, pedigree:e.target.checked})}/>Has pedigree</label>
          <input className="border rounded px-3 py-2 col-span-2" placeholder="Personality (comma separated)" value={form.personality} onChange={e=>setForm({...form, personality:e.target.value})}/>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-gray-100">Cancel</button>
          <button onClick={async ()=>{
            const payload = { ...form, owner_id: ownerId, personality: form.personality.split(',').map(s=>s.trim()).filter(Boolean), photos: [], videos: [], preferences: [] }
            await onCreate(payload)
          }} className="px-3 py-2 rounded-lg bg-emerald-500 text-white">Create</button>
        </div>
      </div>
    </div>
  )
}

function FiltersBar({ filters, setFilters, onApply }) {
  const [local, setLocal] = useState(filters)
  useEffect(()=>setLocal(filters), [filters])
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input value={local.breed||''} onChange={e=>setLocal({...local, breed:e.target.value})} placeholder="Breed" className="border rounded px-3 py-2"/>
      <input type="number" value={local.min_age||''} onChange={e=>setLocal({...local, min_age:e.target.value?Number(e.target.value):undefined})} placeholder="Min age" className="border rounded px-3 py-2 w-28"/>
      <input type="number" value={local.max_age||''} onChange={e=>setLocal({...local, max_age:e.target.value?Number(e.target.value):undefined})} placeholder="Max age" className="border rounded px-3 py-2 w-28"/>
      <select value={local.gender||''} onChange={e=>setLocal({...local, gender:e.target.value||undefined})} className="border rounded px-3 py-2">
        <option value="">Any gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <select value={local.pedigree==null?'':(local.pedigree? 'yes': 'no')} onChange={e=>setLocal({...local, pedigree: e.target.value===''? undefined : e.target.value==='yes'})} className="border rounded px-3 py-2">
        <option value="">Pedigree: Any</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <input value={local.city||''} onChange={e=>setLocal({...local, city:e.target.value})} placeholder="City" className="border rounded px-3 py-2"/>
      <button onClick={()=>onApply(local)} className="px-3 py-2 rounded-lg bg-emerald-500 text-white">Apply</button>
    </div>
  )
}

export default function App() {
  const api = useApi()
  const [species, setSpecies] = useState('dog')
  const [owner, setOwner] = useState(null)
  const [pets, setPets] = useState([])
  const [matches, setMatches] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [filters, setFilters] = useState({})
  const [showAdd, setShowAdd] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [activeMatch, setActiveMatch] = useState(null)

  // boot: create demo owner if none
  useEffect(()=>{
    (async()=>{
      try {
        const email = `demo@owner.com`
        const res = await api.post('/owners', { name:'Demo Owner', email })
        setOwner({ id: res.id, name:'Demo Owner', email })
      } catch(e) {
        // try to fetch by a known id? For demo, ignore
      }
    })()
  }, [])

  const loadPets = async (currentFilters=filters, s=species) => {
    const params = new URLSearchParams({ species: s, ...Object.fromEntries(Object.entries(currentFilters).filter(([,v])=>v!==undefined && v!=='')) })
    const data = await api.get(`/pets?${params.toString()}`)
    setPets(data)
  }

  useEffect(()=>{ loadPets() }, [species])
  useEffect(()=>{ (async()=>{
    const a = await api.get('/announcements')
    setAnnouncements(a)
  })() }, [])

  const swipe = async (pet, action) => {
    if (!owner) return
    // pick owner's first pet if any else use placeholder id
    const myPet = pets.find(p=>p.owner_id===owner?.id) || pets[0]
    if (!myPet) return
    const res = await api.post('/swipe', { liker_pet_id: myPet.id, target_pet_id: pet.id, action, created_by_owner_id: owner.id })
    if (res.status === 'match') {
      const list = await api.get(`/matches/${owner.id}`)
      setMatches(list)
    }
    await loadPets()
  }

  const applyFilters = async (f) => {
    setFilters(f)
    await loadPets(f)
  }

  useEffect(()=>{
    if (!owner) return
    (async()=>{
      const list = await api.get(`/matches/${owner.id}`)
      setMatches(list)
    })()
  }, [owner])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white"><Dog/></div>
            <div>
              <div className="font-semibold text-gray-800">Purebred Pals</div>
              <div className="text-sm text-gray-500">Find the perfect match for your pet</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16}/> Nearby • Global demo
          </div>
        </header>

        <div className="space-y-4">
          <Toolbar species={species} setSpecies={setSpecies} onOpenNew={()=>setShowAdd(true)} onOpenFilters={()=>{}}/>
          <div className="p-4 rounded-xl bg-white/60 border border-emerald-100">
            <FiltersBar filters={filters} setFilters={setFilters} onApply={applyFilters} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <div className="md:col-span-2 space-y-4">
              {pets.length ? pets.map(p => (
                <SwipeCard key={p.id} pet={p} onLike={()=>swipe(p, 'like')} onPass={()=>swipe(p, 'pass')} />
              )) : (
                <div className="h-64 rounded-2xl bg-white border border-dashed border-emerald-200 flex items-center justify-center text-gray-500">No pets found. Adjust filters or add your pet.</div>
              )}
            </div>
            <div>
              <Sidebar matches={matches} onOpenChat={(m)=>{ setActiveMatch(m); setShowChat(true) }} announcements={announcements} />
            </div>
          </div>
        </div>
      </div>

      <AddPetModal open={showAdd} onClose={()=>setShowAdd(false)} ownerId={owner?.id} species={species} onCreate={async (payload)=>{
        await api.post('/pets', payload)
        setShowAdd(false)
        await loadPets()
      }} />

      <ChatDrawer open={showChat} onClose={()=>setShowChat(false)} match={activeMatch} api={api} />
    </div>
  )
}
