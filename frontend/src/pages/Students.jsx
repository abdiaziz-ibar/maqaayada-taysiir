import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Search, X, Pencil, Trash2, FileText, Eye, RefreshCcw, Users, GraduationCap, UserX, UsersRound } from "lucide-react";
import api from "../api/axios";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { useAuth } from "../context/AuthContext";
import { downloadWordTable } from "../utils/exportWord";

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="card flex items-center gap-3 p-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${color}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xl font-display font-semibold leading-none">{value}</p>
      <p className="text-ink/50 text-xs mt-1.5">{label}</p>
    </div>
  </div>
);

const STATUS_FILTERS = [["all", "Dhammaan"], ["active", "Firfircoon"], ["inactive", "Aan Firfircoonayn"]];

const StudentModal = ({ open, onClose, onSaved, editing }) => {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [mealPlanId, setMealPlanId] = useState("");
  const [classes, setClasses] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [parentMode, setParentMode] = useState("existing");
  const [parentSearch, setParentSearch] = useState("");
  const [parentOptions, setParentOptions] = useState([]);
  const [parentId, setParentId] = useState("");
  const [newParentName, setNewParentName] = useState("");
  const [newParentPhone, setNewParentPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    api.get("/classes").then((res) => setClasses(res.data.classes));
    api.get("/meal-plans").then((res) => setMealPlans(res.data.mealPlans));
    if (editing) {
      setFullName(editing.fullName);
      setGender(editing.gender || "");
      setDateOfBirth(editing.dateOfBirth ? editing.dateOfBirth.slice(0, 10) : "");
      setClassId(editing.classId || "");
      setSectionId(editing.sectionId || "");
      setMealPlanId(editing.mealPlanId || "");
      setParentId(editing.parentId || "");
      setParentMode("existing");
    } else {
      setFullName(""); setGender(""); setDateOfBirth(""); setClassId(""); setSectionId(""); setMealPlanId("");
      setParentId(""); setNewParentName(""); setNewParentPhone(""); setParentSearch(""); setParentMode("existing");
    }
  }, [open, editing]);

  useEffect(() => {
    if (!open || parentMode !== "existing") return;
    const t = setTimeout(() => {
      api.get("/parents", { params: parentSearch ? { search: parentSearch } : {} }).then((res) => setParentOptions(res.data.parents));
    }, 250);
    return () => clearTimeout(t);
  }, [open, parentMode, parentSearch]);

  if (!open) return null;

  const selectedClass = classes.find((c) => c.id === classId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        fullName,
        gender: gender || undefined,
        dateOfBirth: dateOfBirth || undefined,
        classId: classId || null,
        sectionId: sectionId || null,
        mealPlanId: mealPlanId || null,
      };
      if (editing) {
        if (parentId) payload.parentId = parentId;
        await api.put(`/students/${editing._id}`, payload);
      } else {
        if (parentMode === "existing") {
          if (!parentId) { setError("Fadlan dooro waalid."); setLoading(false); return; }
          payload.parentId = parentId;
        } else {
          payload.newParent = { fullName: newParentName, phone: newParentPhone };
        }
        await api.post("/students", payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khalad ayaa dhacay.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">{editing ? "Wax Ka Beddel Ardayga" : "Arday Cusub"}</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-danger/10 text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="label-field">Magaca Ardayga</label>
            <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field">Jinsiga</label>
              <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">-- Dooro --</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="label-field">Taariikhda Dhalashada</label>
              <input type="date" className="input-field" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-field">Fasalka</label>
              <select className="input-field" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}>
                <option value="">-- Dooro Fasal --</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">Qaybta (Section)</label>
              <select className="input-field" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!selectedClass?.sections?.length}>
                <option value="">-- Ma jiro --</option>
                {selectedClass?.sections?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label-field">Meal Plan (haddii uu joogto ku qorayo cuntada)</label>
            <select className="input-field" value={mealPlanId} onChange={(e) => setMealPlanId(e.target.value)}>
              <option value="">-- Ma jiro (Mar-mar cunta oo kaliya) --</option>
              {mealPlans.map((p) => <option key={p.id} value={p.id}>{p.name} — ${p.monthlyPrice}/bishii</option>)}
            </select>
          </div>

          {!editing && (
            <div className="flex gap-2 text-sm bg-paper rounded-full p-1">
              <button type="button" onClick={() => setParentMode("existing")} className={`flex-1 py-1.5 rounded-full ${parentMode === "existing" ? "bg-surface shadow-sm" : "text-ink/50"}`}>Waalid Jira</button>
              <button type="button" onClick={() => setParentMode("new")} className={`flex-1 py-1.5 rounded-full ${parentMode === "new" ? "bg-surface shadow-sm" : "text-ink/50"}`}>Waalid Cusub</button>
            </div>
          )}

          {(editing || parentMode === "existing") ? (
            <div className="space-y-2">
              <label className="label-field">{editing ? "Beddel Waalidka (ikhtiyaari)" : null}</label>
              <input className="input-field" placeholder="Raadi waalid..." value={parentSearch} onChange={(e) => setParentSearch(e.target.value)} />
              <select className="input-field" value={parentId} onChange={(e) => setParentId(e.target.value)} required={!editing}>
                <option value="">-- Dooro Waalid --</option>
                {parentOptions.map((p) => <option key={p._id} value={p._id}>{p.fullName} ({p.phone})</option>)}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <input className="input-field" placeholder="Magaca Waalidka" value={newParentName} onChange={(e) => setNewParentName(e.target.value)} required />
              <input className="input-field" placeholder="Telefoonka" value={newParentPhone} onChange={(e) => setNewParentPhone(e.target.value)} required />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Waa la kaydinayaa..." : "Kaydi"}
          </button>
        </form>
      </div>
    </div>
  );
};

const Students = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const classIdFilter = searchParams.get("classId") || "";
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/students", { params: { ...(search ? { search } : {}), ...(classIdFilter ? { classId: classIdFilter } : {}) } })
      .then((res) => setStudents(res.data.students))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, classIdFilter]);

  const exportWord = () => {
    downloadWordTable({
      title: "Liiska Ardayda",
      headers: ["Code", "Magaca", "Fasalka", "Waalidka", "Telefoonka", "Meal Plan", "Xaalada"],
      rows: students.map((s) => [
        s.studentCode,
        s.fullName,
        `${s.class?.name || "-"}${s.section ? ` (${s.section.name})` : ""}`,
        s.parent?.fullName,
        s.parent?.phone,
        s.mealPlan?.name || "Mar-mar oo kaliya",
        s.status === "active" ? "Firfircoon" : "Aan Firfircoonayn",
      ]),
      fileName: "ardayda",
    });
  };

  const toggleStatus = async (student) => {
    await api.put(`/students/${student._id}`, { status: student.status === "active" ? "inactive" : "active" });
    load();
  };

  const activeCount = students.filter((s) => s.status === "active").length;
  const inactiveCount = students.length - activeCount;
  const maleCount = students.filter((s) => s.gender === "male").length;
  const femaleCount = students.filter((s) => s.gender === "female").length;
  const visibleStudents = students.filter((s) => statusFilter === "all" || s.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl">Ardayda</h1>
          <p className="text-ink/50 text-sm mt-0.5">Maamul diiwaangelinta, fasallada, iyo xogta ardayda</p>
        </div>
        <button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Arday Cusub
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} value={students.length} label="Wadarta Ardayda" color="bg-[#2D6CDF]" />
        <StatCard icon={GraduationCap} value={activeCount} label="Firfircoon" color="bg-success" />
        <StatCard icon={UserX} value={inactiveCount} label="Aan Firfircoonayn" color="bg-amber" />
        <StatCard icon={UsersRound} value={`${maleCount}M / ${femaleCount}F`} label="Gender Ratio" color="bg-[#C23B8D]" />
      </div>

      <div className="card flex items-center flex-wrap gap-3 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input className="input-field pl-9" placeholder="Raadi magac ama code..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map(([v, label]) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${statusFilter === v ? "bg-brand text-white" : "bg-paper text-ink/60 hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={load} className="p-2 rounded-lg text-ink/50 hover:text-ink hover:bg-paper" title="Cusboonaysii">
            <RefreshCcw size={16} />
          </button>
          <button onClick={exportWord} disabled={students.length === 0} className="p-2 rounded-lg text-ink/50 hover:text-ink hover:bg-paper disabled:opacity-40" title="Word ga dhoh">
            <FileText size={16} />
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Arday</th>
              <th>Student ID</th>
              <th>Fasalka</th>
              <th>Waalidka</th>
              <th>Meal Plan</th>
              <th>Xaalada</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((s) => (
              <tr key={s._id} className="cursor-pointer hover:bg-paper" onClick={() => navigate(`/students/${s._id}`)}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-semibold text-sm shrink-0">
                      {s.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{s.fullName}</p>
                      <p className="text-ink/40 text-xs capitalize">{s.gender || "-"}</p>
                    </div>
                  </div>
                </td>
                <td><span className="font-mono text-xs bg-paper border border-line rounded px-2 py-1">{s.studentCode}</span></td>
                <td>{s.class?.name || "-"} {s.section ? `(${s.section.name})` : ""}</td>
                <td>
                  <p className="text-ink">{s.parent?.fullName}</p>
                  <p className="text-ink/40 text-xs">{s.parent?.phone}</p>
                </td>
                <td>{s.mealPlan?.name || <span className="text-ink/40">Mar-mar oo kaliya</span>}</td>
                <td>
                  <span className="flex items-center gap-1.5 text-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === "active" ? "bg-success" : "bg-danger"}`} />
                    {s.status === "active" ? "Firfircoon" : "Aan Firfircoonayn"}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => navigate(`/students/${s._id}`)} className="text-ink/40 hover:text-ink" title="Fiiri">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => { setEditing(s); setShowAdd(true); }} className="text-ink/40 hover:text-ink" title="Wax ka beddel">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => toggleStatus(s)} className="text-link text-xs hover:underline whitespace-nowrap">
                      {s.status === "active" ? "Jooji" : "Dib u Hawlgeli"}
                    </button>
                    {user?.role === "admin" && (
                      <button onClick={() => setDeleting(s)} className="text-danger/70 hover:text-danger" title="Tirtir">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && visibleStudents.length === 0 && (
              <tr><td colSpan={7} className="text-center text-ink/40 py-6">Arday lama helin.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <StudentModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={load} editing={editing} />
      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await api.delete(`/students/${deleting._id}`); load(); }}
        title="Tirtir Ardayga"
        description={deleting ? `Ma hubtaa inaad tirtirayso "${deleting.fullName}"? Waxaa la tirtiri doonaa dhammaan invoice-yadiisa iyo xogta cuntada.` : ""}
      />
    </div>
  );
};

export default Students;
