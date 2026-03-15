import { useState } from "react";
import { COLORS, DAYS, formatTime, getBusyness, getBusyPeople, getFreePeople, heatColor, HOURS, parseICS } from "./utils";
import { IndividualTimetable } from "./components/IndividualTimetable";
import { AddEventModal } from "./components/AddEventModal";
import { PlanActivityModal } from "./components/PlanActivityModal";
import "./index.css";
import { Avatar } from "./components/Avatar";
import { Pill } from "./components/Pill";
import { TopBar } from "./components/TopBar";
import { FriendFilter } from "./components/FriendFilter";
import { RSVPPanel } from "./components/RSVPPanel";
import { useGroup } from "./hooks/useGroup";
import { useEffect } from "react";


const ACTIVITY_SUGGESTIONS = [
  { id: "s1", title: "Bowling Night",      category: "external", location: "Zone Bowling Newtown",        duration: 2, emoji: "🎳" },
  { id: "s2", title: "Trivia Night",       category: "external", location: "The Lansdowne Hotel",         duration: 2, emoji: "🎯" },
  { id: "s3", title: "Coffee & Study",     category: "uni",      location: "UNSW Library Cafe",           duration: 1, emoji: "☕" },
  { id: "s4", title: "Hiking Trip",        category: "external", location: "Spit Bridge Walk, Mosman",    duration: 4, emoji: "🥾" },
  { id: "s5", title: "Arc Club Fair",      category: "uni",      location: "Upper Campus Lawns",          duration: 2, emoji: "🎪" },
  { id: "s6", title: "Pub Crawl",          category: "external", location: "King Street, Newtown",        duration: 3, emoji: "🍺" },
  { id: "s7", title: "Movie Night",        category: "external", location: "Ritz Cinema, Randwick",       duration: 3, emoji: "🎬" },
  { id: "s8", title: "Beach Day",          category: "external", location: "Coogee Beach",                duration: 4, emoji: "🏖️" },
  { id: "s9", title: "Board Game Night",   category: "uni",      location: "Upper Campus Common Room",    duration: 3, emoji: "🎲" },
  { id: "s10",title: "Sports Tournament",  category: "uni",      location: "UNSW Arc Sports Fields",      duration: 2, emoji: "🏅" },
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App({
  currentGroupId, profile, groups,
  onSelectGroup, onCreateGroup, onJoinGroup, onSignOut, updateProfile
}) {
  const { members, events, activities, addEvent, addActivity, upsertRSVP } = useGroup(currentGroupId);
  // friends becomes members — same shape, same usage
  const friends = members.map(m =>
      m.id === profile?.id ? { ...m, ...profile } : m,
  );
  const [view, setView] = useState("heatmap"); // heatmap | group
  const [tooltip, setTooltip] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [busyModal, setBusyModal] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showPlanActivity, setShowPlanActivity] = useState(false);
  const [rsvpActivity, setRsvpActivity] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set(friends.map(f => f.id)));
  const [darkMode, setDarkMode] = useState(true);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const currentGroup = groups.find(g => g.id === currentGroupId);



  const SLOT_H = 48;

  const handleAddEvent = async ev => {
      await addEvent({ ...ev, color: profile.color });
  };

  // Plan activity
  const handlePlanActivity = async act => {
      await addActivity({ ...act, created_by: profile.id });
  };
  const handleRSVP = async (activityId, user_id, answer) => {
    await upsertRSVP(activityId, user_id, answer)
  };

  const handleImportICS = (user_id) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.ics'

    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (ev) => {
        try {
          const parsed = parseICS(ev.target.result, user_id, profile.color)

          if (parsed.length === 0) {
            alert('No events found in this file.')
            return
          }

          // Skip events already in the calendar for this user
          const newEvents = parsed.filter(p =>
            !events.some(ex =>
              ex.userId === p.userId &&
              ex.day    === p.day    &&
              ex.start  === p.start  &&
              ex.title  === p.title
            )
          )

          if (newEvents.length === 0) {
            alert('All events already exist in the calendar.')
            return
          }

          for (const event of newEvents) {
            await addEvent({ ...event, group_id: currentGroupId })
          }
        } catch (err) {
          console.error('ICS import failed:', err)
          alert(`Import failed: ${err.message}`)
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }
  useEffect(() => {}, [events, activities]);

  useEffect(() => {
    setActiveFilters(prev => {
      const newSet = new Set(prev);
      friends.forEach(f => newSet.add(f.id));
      return newSet;
    });
  }, [members]);

  const getFilteredFriends = () => friends.filter(f => activeFilters.has(f.id));
  const getFilteredEvents = () => events.filter(e => activeFilters.has(e.user_id));


  const cssVars = darkMode ? {
    "--bg": "#141416", "--text": "#e8e6e1", "--muted": "#6e6c65",
    "--border": "#2a2826", "--input-bg": "#1e1e20",
  } : {
    "--bg": "#fafaf8", "--text": "#1a1a18", "--muted": "#8a8880",
    "--border": "#e4e2dc", "--input-bg": "#f1efe8",
  };

  return (
    <div style={{ ...cssVars, minHeight: "100vh", background: "var(--bg)", fontFamily: "'DM Sans', sans-serif", color: "var(--text)" }}>
      <TopBar view={view} setView={setView} setShowAddEvent={setShowAddEvent} setShowPlanActivity={setShowPlanActivity} darkMode={darkMode} setDarkMode={setDarkMode} setShowGroupMenu={setShowGroupMenu} showGroupMenu={showGroupMenu} currentGroup={currentGroup} groups={groups} currentGroupId={currentGroupId} onSelectGroup={onSelectGroup} onSignOut={onSignOut} profile={profile} updateProfile={updateProfile} />
      <FriendFilter friends={friends} profile={profile} activeFilters={activeFilters} setActiveFilters={setActiveFilters} handleImportICS={handleImportICS} />
      
      {/* ── Main Calendar ── */}
      <div style={{ overflowX: "auto", overflowY: "auto", padding: "0 16px 16px" }}>
        <div style={{ minWidth: 640 }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", gap: 2, padding: "10px 0 4px", position: "sticky", top: 0, background: "var(--bg)", zIndex: 10 }}>
            <div />
            {DAYS.map(day => (
              <div key={day} style={{ textAlign: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "var(--muted)" }}>{day}</span>
              </div>
            ))}
          </div>

          {/* Time grid */}
          {HOURS.map(hour => (
            <div key={hour} style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", gap: 2, marginBottom: 1 }}>
              {/* Time label */}
              <div style={{
                fontSize: 10, color: "var(--muted)", textAlign: "right", paddingRight: 8,
                paddingTop: 4, lineHeight: `${SLOT_H}px`, fontFamily: "'DM Mono', monospace",
              }}>{formatTime(hour)}</div>

              {/* Day cells */}
              {DAYS.map((_, di) => {
                const ratio = view === "heatmap"
                  ? getBusyness(getFilteredEvents(), di, hour, getFilteredFriends())
                  : 0;
                // const cellEvents = getFilteredEvents().filter(e => e.day === di && e.start <= hour && e.end > hour && e.start === hour);
                const actsHere = activities.filter(a => a.day === di && a.start <= hour && a.end > hour && a.start === hour);
                // const isStartCell = getFilteredEvents().some(e => e.day === di && e.start === hour);
                const freePeople = getFreePeople(getFilteredEvents(), di, hour, getFilteredFriends());
                const busyPeople = getBusyPeople(getFilteredEvents(), di, hour, getFilteredFriends());
                return (
                  <div
                    key={di}
                    className="slot-hover"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ day: di, hour, x: rect.left, y: rect.top, free: freePeople, busy: busyPeople });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => {
                      if (busyPeople.length > 0) setBusyModal({ day: di, hour, busyPeople });
                    }}
                    style={{
                      height: SLOT_H, position: "relative",
                      background: view === "heatmap" ? heatColor(ratio) : "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: 4, overflow: "visible",
                      transition: "background 0.2s",
                    }}
                  >
                    {/* Group view: stacked event blocks */}
                    {view === "group" && (() => {
                      const startEvs = getFilteredEvents().filter(e => e.day === di && e.start === hour);
                      const W = 100 / Math.max(startEvs.length, 1);
                      return startEvs.map((ev, idx) => {
                        const h = (ev.end - ev.start) * SLOT_H;
                        const friend = friends.find(f => f.id === ev.user_id);
                        const color = friend ? friend.color : ev.color;
                        return (
                          <div key={ev.id} onClick={e => { e.stopPropagation(); setSelectedFriend(friend); }} style={{
                            position: "absolute", top: 1, left: `${idx * W + 0.5}%`,
                            width: `${W - 1}%`, height: h - 2,
                            background: color + "28", border: `1.5px solid ${color}77`,
                            borderRadius: 5, padding: "2px 4px", cursor: "pointer", zIndex: 2,
                            overflow: "hidden",
                          }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: color, lineHeight: 1.2 }}>{ev.title}</div>
                            {ev.location && <div style={{ fontSize: 9, color: color + "aa" }}>📍 {ev.location}</div>}
                            <div style={{ fontSize: 9, color: color + "88" }}>{formatTime(ev.start)}–{formatTime(ev.end)}</div>
                          </div>
                        );
                      });
                    })()}

                    {/* Activity blocks */}
                    {actsHere.map(act => {
                      const h = (act.end - act.start) * SLOT_H;
                      const yesCount = Object.values(act.rsvps).filter(v => v === "yes").length;
                      return (
                        <div key={act.id} className="act-block" onClick={e => { e.stopPropagation(); setRsvpActivity(act); }} style={{
                          position: "absolute", top: 1, left: "0%", right: 0, height: h - 2,
                          background: "#c9a84c22", border: "2px solid #c9a84c",
                          borderRadius: 6, padding: "3px 6px", cursor: "pointer", zIndex: 5,
                          overflow: "hidden",
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#c9a84c" }}>
                            {act.emoji} {act.title}
                          </div>
                          <div style={{ fontSize: 9, color: "#c9a84caa" }}>📍 {act.location}</div>
                          <div style={{ fontSize: 9, color: "#c9a84c88" }}>{yesCount} coming · click to RSVP</div>
                        </div>
                      );
                    })}

                    {/* Heatmap: tiny friend dots */}
                    {view === "heatmap" && ratio > 0 && (
                      <div style={{
                        position: "absolute", bottom: 2, right: 3,
                        display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end",
                      }}>
                        {getBusyPeople(getFilteredEvents(), di, hour, getFilteredFriends()).map(f => (
                          <div key={f.id} style={{
                            width: 5, height: 5, borderRadius: "50%", background: f.color,
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Heatmap Legend ── */}
      {view === "heatmap" && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "8px 20px",
          borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--muted)",
        }}>
          <span style={{ fontWeight: 600 }}>Availability:</span>
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {[0, 0.25, 0.5, 0.75, 1].map(r => (
              <div key={r} style={{ width: 20, height: 12, background: r === 0 ? "var(--border)" : heatColor(r), borderRadius: 2 }} />
            ))}
          </div>
          <span>Low busyness (more free)</span>
          <span>→</span>
          <span>High busyness (fewer free)</span>
          <span style={{ marginLeft: "auto" }}>Click busy slot to see who's occupied · Hover for details</span>
        </div>
      )}

      {/* ── Planned Activities Panel ── */}
      {activities.length > 0 && (
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 10, letterSpacing: "0.06em" }}>
            PLANNED ACTIVITIES
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {activities.map(act => {
              const yesCount = Object.values(act.rsvps).filter(v => v === "yes").length;
              const noCount = Object.values(act.rsvps).filter(v => v === "no").length;
              const pendingCount = Object.values(act.rsvps).filter(v => v === null).length;
              return (
                <div key={act.id} onClick={() => setRsvpActivity(act)} style={{
                  background: "var(--input-bg)", border: "1.5px solid #c9a84c66",
                  borderRadius: 10, padding: "10px 14px", cursor: "pointer",
                  minWidth: 180, flex: "0 0 auto",
                }}>
                  <div style={{ fontSize: 18, marginBottom: 3 }}>{act.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{act.title}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {DAYS[act.day]} · {formatTime(act.start)} – {formatTime(act.end)}
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                    {yesCount > 0 && <Pill label={`✓ ${yesCount}`} color="#6bbf8e" small />}
                    {noCount > 0 && <Pill label={`✗ ${noCount}`} color="#d4836e" small />}
                    {pendingCount > 0 && <Pill label={`? ${pendingCount}`} color="#c9a84c" small />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tooltip ── */}
      {tooltip && (
        <div style={{
          position: "fixed", left: Math.min(tooltip.x, window.innerWidth - 220),
          top: tooltip.y - 10, transform: "translateY(-100%)",
          background: darkMode ? "#1e1e20" : "#fff",
          border: "1px solid var(--border)", borderRadius: 10,
          padding: "10px 13px", zIndex: 999, pointerEvents: "none",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", minWidth: 180,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>
            {DAYS[tooltip.day]} · {formatTime(tooltip.hour)}
          </div>
          {tooltip.free.length > 0 && (
            <div style={{ marginBottom: 5 }}>
              <div style={{ fontSize: 10, color: "#6bbf8e", fontWeight: 600, marginBottom: 3 }}>FREE</div>
              {tooltip.free.map(f => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.color }} />
                  <span style={{ fontSize: 11, color: "var(--text)" }}>{f.name}</span>
                </div>
              ))}
            </div>
          )}
          {tooltip.busy.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: "#d4836e", fontWeight: 600, marginBottom: 3 }}>BUSY</div>
              {tooltip.busy.map(f => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.color }} />
                  <span style={{ fontSize: 11, color: "var(--text)" }}>{f.name}</span>
                  {f.event && <span style={{ fontSize: 10, color: "var(--muted)" }}>· {f.event.title}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Busy Modal (click on busy cell) ── */}
      {busyModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }} onClick={() => setBusyModal(null)}>
          <div style={{
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 20, width: "min(380px,90vw)",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--text)" }}>
              {DAYS[busyModal.day]} · {formatTime(busyModal.hour)}
            </div>
            {busyModal.busyPeople.map(f => (
              <div key={f.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 0", borderBottom: "1px solid var(--border)",
              }}>
                <Avatar user={f} size={30} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{f.name}</div>
                  {f.event && (
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {f.event.title} · {formatTime(f.event.start)}–{formatTime(f.event.end)} · {f.event.location}
                    </div>
                  )}
                </div>
                <button onClick={() => { setBusyModal(null); setSelectedFriend(f); }} style={{
                  marginLeft: "auto", background: f.color + "22", border: `1px solid ${f.color}44`,
                  color: f.color, borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer",
                }}>View →</button>
              </div>
            ))}
            <button onClick={() => setBusyModal(null)} style={{
              marginTop: 14, width: "100%", background: "var(--input-bg)",
              border: "1px solid var(--border)", color: "var(--text)", borderRadius: 8,
              padding: "8px 0", fontSize: 13, cursor: "pointer",
            }}>Close</button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {selectedFriend && (
        <IndividualTimetable
          friend={selectedFriend}
          events={events}
          onClose={() => setSelectedFriend(null)}
        />
      )}
      {showAddEvent && (
        <AddEventModal
          friends={friends}
          onAdd={handleAddEvent}
          onClose={() => setShowAddEvent(false)}
        />
      )}
      {showPlanActivity && (
        <PlanActivityModal
          friends={getFilteredFriends()}
          events={getFilteredEvents()}
          suggestions={ACTIVITY_SUGGESTIONS}
          onPlan={handlePlanActivity}
          onClose={() => setShowPlanActivity(false)}
        />
      )}
      {rsvpActivity && (
        <RSVPPanel
          activity={rsvpActivity}
          friends={friends}
          onRSVP={handleRSVP}
          onClose={() => setRsvpActivity(null)}
        />
      )}
    </div>
  );
}
