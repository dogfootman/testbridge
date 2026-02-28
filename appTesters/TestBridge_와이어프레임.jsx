import { useState } from "react";

const screens = {
  landing: "landing",
  signup: "signup",
  mypage: "mypage",
  devDashboard: "devDashboard",
  appRegister: "appRegister",
  appDetail: "appDetail",
  testerHome: "testerHome",
  testerAppDetail: "testerAppDetail",
  testerMyTests: "testerMyTests",
  feedback: "feedback",
  reward: "reward",
  cs: "cs",
  adminDashboard: "adminDashboard",
};

// Color system
const c = {
  bg: "#0B0F1A",
  card: "#131827",
  cardHover: "#1A2035",
  border: "#1E2740",
  accent: "#3B82F6",
  accentGlow: "rgba(59,130,246,0.15)",
  green: "#22C55E",
  greenGlow: "rgba(34,197,94,0.12)",
  orange: "#F59E0B",
  orangeGlow: "rgba(245,158,11,0.12)",
  red: "#EF4444",
  redGlow: "rgba(239,68,68,0.12)",
  purple: "#A855F7",
  text: "#E2E8F0",
  textDim: "#64748B",
  textMuted: "#475569",
};

const Badge = ({ children, color = c.accent, glow }) => (
  <span
    style={{
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: glow || c.accentGlow,
      color,
      letterSpacing: 0.3,
    }}
  >
    {children}
  </span>
);

const Button = ({ children, primary, small, onClick, style }) => (
  <button
    onClick={onClick}
    style={{
      padding: small ? "6px 14px" : "10px 20px",
      borderRadius: 8,
      border: primary ? "none" : `1px solid ${c.border}`,
      background: primary
        ? `linear-gradient(135deg, ${c.accent}, #2563EB)`
        : "transparent",
      color: primary ? "#fff" : c.textDim,
      fontSize: small ? 12 : 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
      ...style,
    }}
  >
    {children}
  </button>
);

const Card = ({ children, onClick, style }) => (
  <div
    onClick={onClick}
    style={{
      background: c.card,
      border: `1px solid ${c.border}`,
      borderRadius: 14,
      padding: 20,
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s",
      ...style,
    }}
  >
    {children}
  </div>
);

const ProgressBar = ({ value, max, color = c.accent }) => (
  <div
    style={{
      width: "100%",
      height: 6,
      background: "#1E2740",
      borderRadius: 3,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${(value / max) * 100}%`,
        height: "100%",
        background: color,
        borderRadius: 3,
        transition: "width 0.5s ease",
      }}
    />
  </div>
);

const AppIcon = ({ emoji, size = 44 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 12,
      background: `linear-gradient(135deg, ${c.accent}22, ${c.purple}22)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.5,
      flexShrink: 0,
    }}
  >
    {emoji}
  </div>
);

const TabBar = ({ tabs, active, onSelect }) => (
  <div
    style={{
      display: "flex",
      gap: 0,
      borderBottom: `1px solid ${c.border}`,
      marginBottom: 20,
    }}
  >
    {tabs.map((t) => (
      <button
        key={t}
        onClick={() => onSelect(t)}
        style={{
          padding: "10px 18px",
          background: "none",
          border: "none",
          borderBottom: active === t ? `2px solid ${c.accent}` : "2px solid transparent",
          color: active === t ? c.accent : c.textDim,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {t}
      </button>
    ))}
  </div>
);

const Nav = ({ role, setRole, screen, setScreen }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 24px",
      borderBottom: `1px solid ${c.border}`,
      background: c.bg,
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        🔗
      </div>
      <span
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: c.text,
          letterSpacing: -0.5,
        }}
      >
        TestBridge
      </span>
    </div>

    <div style={{ display: "flex", gap: 6, background: "#0D1117", borderRadius: 10, padding: 3 }}>
      <button
        onClick={() => { setRole("dev"); setScreen(screens.devDashboard); }}
        style={{
          padding: "6px 16px",
          borderRadius: 8,
          border: "none",
          background: role === "dev" ? c.accent : "transparent",
          color: role === "dev" ? "#fff" : c.textDim,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        개발자
      </button>
      <button
        onClick={() => { setRole("tester"); setScreen(screens.testerHome); }}
        style={{
          padding: "6px 16px",
          borderRadius: 8,
          border: "none",
          background: role === "tester" ? c.green : "transparent",
          color: role === "tester" ? "#fff" : c.textDim,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        테스터
      </button>
      <button
        onClick={() => { setRole("admin"); setScreen(screens.adminDashboard); }}
        style={{
          padding: "6px 16px",
          borderRadius: 8,
          border: "none",
          background: role === "admin" ? c.red : "transparent",
          color: role === "admin" ? "#fff" : c.textDim,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        관리자
      </button>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span onClick={() => setScreen(screens.cs)} style={{ fontSize: 18, cursor: "pointer" }}>💬</span>
      <div style={{ position: "relative" }}>
        <span style={{ fontSize: 18, cursor: "pointer" }}>🔔</span>
        <div
          style={{
            position: "absolute",
            top: -2,
            right: -4,
            width: 8,
            height: 8,
            borderRadius: 4,
            background: c.red,
          }}
        />
      </div>
      <div
        onClick={() => setScreen(screens.mypage)}
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${c.accent}44, ${c.purple}44)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        👤
      </div>
    </div>
  </div>
);

// ============ SCREENS ============

// ============ SIGNUP ============

const SignupScreen = ({ setScreen, setRole }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [agreed, setAgreed] = useState(false);
  return (
    <div style={{ padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🔗</div>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: c.text, margin: "0 0 6px" }}>TestBridge 가입</h2>
        <p style={{ fontSize: 13, color: c.textDim, margin: 0 }}>개발자와 테스터를 연결하는 플랫폼</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 10 }}>소셜 로그인</div>
        {[
          { name: "Google 계정으로 시작", icon: "G", color: "#EA4335", required: true },
          { name: "카카오 계정으로 시작", icon: "K", color: "#FEE500", textColor: "#000" },
          { name: "네이버 계정으로 시작", icon: "N", color: "#03C75A" },
        ].map((social) => (
          <div key={social.name} style={{ height: 46, borderRadius: 10, border: `1px solid ${c.border}`, background: c.card, display: "flex", alignItems: "center", padding: "0 16px", marginBottom: 8, cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: social.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: social.textColor || "#fff", marginRight: 12 }}>
              {social.icon}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: c.text, flex: 1 }}>{social.name}</span>
            {social.required && <Badge color={c.accent}>필수</Badge>}
          </div>
        ))}
        <div style={{ fontSize: 11, color: c.textDim, marginTop: 6 }}>* Google 계정은 Play Console 연동을 위해 필수입니다</div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 10 }}>역할 선택</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { role: "dev", icon: "💻", name: "개발자", desc: "앱을 등록하고 테스터를 모집" },
            { role: "tester", icon: "🔍", name: "테스터", desc: "앱을 테스트하고 리워드 수령" },
            { role: "both", icon: "🔄", name: "둘 다", desc: "개발자 + 테스터 역할 모두" },
          ].map((r) => (
            <div
              key={r.role}
              onClick={() => setSelectedRole(r.role)}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                border: `2px solid ${selectedRole === r.role ? c.accent : c.border}`,
                background: selectedRole === r.role ? c.accentGlow : c.card,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: selectedRole === r.role ? c.accent : c.text, marginBottom: 4 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: c.textDim, lineHeight: 1.4 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 12 }}>프로필 설정</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, border: `2px dashed ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 24 }}>📷</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: c.textDim, marginBottom: 6 }}>프로필 이미지</div>
            <Button small>사진 업로드</Button>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: c.textDim, display: "block", marginBottom: 6 }}>닉네임</label>
          <div style={{ height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", padding: "0 12px", color: c.textMuted, fontSize: 13 }}>
            닉네임을 입력하세요
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: c.textDim, display: "block", marginBottom: 6 }}>소개 (선택)</label>
          <div style={{ height: 60, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, padding: 12, boxSizing: "border-box", color: c.textMuted, fontSize: 13 }}>
            간단한 자기소개를 작성해주세요
          </div>
        </div>
      </Card>

      <div style={{ marginBottom: 24 }}>
        <div
          onClick={() => setAgreed(!agreed)}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 8 }}
        >
          <div style={{ width: 22, height: 22, borderRadius: 6, background: agreed ? c.accent : c.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", flexShrink: 0 }}>
            {agreed ? "✓" : ""}
          </div>
          <span style={{ fontSize: 13, color: c.text }}>이용약관 및 개인정보처리방침에 동의합니다</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: 32 }}>
          <span style={{ fontSize: 12, color: c.accent, cursor: "pointer" }}>이용약관</span>
          <span style={{ fontSize: 12, color: c.textMuted }}>|</span>
          <span style={{ fontSize: 12, color: c.accent, cursor: "pointer" }}>개인정보처리방침</span>
        </div>
      </div>

      <Button
        primary
        onClick={() => {
          if (selectedRole === "tester") { setRole("tester"); setScreen(screens.testerHome); }
          else { setRole("dev"); setScreen(screens.devDashboard); }
        }}
        style={{ width: "100%", padding: "14px 0", fontSize: 16 }}
      >
        가입 완료
      </Button>

      <div style={{ textAlign: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: c.textDim }}>이미 계정이 있나요? </span>
        <span style={{ fontSize: 13, color: c.accent, cursor: "pointer", fontWeight: 600 }}>로그인</span>
      </div>
    </div>
  );
};

// ============ MY PAGE ============

const MyPageScreen = ({ setScreen, role, setRole }) => {
  const [notiSettings, setNotiSettings] = useState({ push: true, email: true, sms: false });
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 20 }}>마이페이지</h2>

      <Card style={{ marginBottom: 20, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: `linear-gradient(135deg, ${c.accent}33, ${c.purple}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>dev_hong</div>
            <div style={{ fontSize: 13, color: c.textDim, marginTop: 2 }}>hong.dev@gmail.com</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <Badge color={role === "dev" ? c.accent : c.green} glow={role === "dev" ? c.accentGlow : c.greenGlow}>
                {role === "dev" ? "개발자" : "테스터"}
              </Badge>
              {role === "dev" && <Badge color={c.purple} glow={`${c.purple}22`}>Basic 구독</Badge>}
              {role === "tester" && <Badge color={c.orange} glow={c.orangeGlow}>골드 테스터</Badge>}
            </div>
          </div>
          <Button small>편집</Button>
        </div>
      </Card>

      {role === "dev" && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>개발자 활동</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { label: "등록 앱", value: "16", color: c.accent },
              { label: "프로덕션 성공", value: "12", color: c.green },
              { label: "진행 중", value: "3", color: c.orange },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {role === "tester" && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>테스터 활동</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {[
              { label: "테스트 완료", value: "15", color: c.green },
              { label: "완료율", value: "94%", color: c.accent },
              { label: "총 리워드", value: "45,000원", color: c.orange },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>신뢰도 점수</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: c.orange }}>92점 · 골드</span>
            </div>
            <ProgressBar value={92} max={100} color={c.orange} />
            <div style={{ fontSize: 11, color: c.textDim, marginTop: 4 }}>다이아몬드까지 8점 남음</div>
          </div>
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>구독 & 크레딧</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 13, color: c.textDim }}>현재 플랜</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.accent, marginTop: 2 }}>Basic (19,900원/월)</div>
          </div>
          <Button small>변경</Button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 13, color: c.textDim }}>이번 달 남은 앱 등록</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginTop: 2 }}>7 / 10개</div>
          </div>
          <ProgressBar value={3} max={10} color={c.accent} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 13, color: c.textDim }}>크레딧 잔액</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.purple, marginTop: 2 }}>140 크레딧</div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>역할 전환</div>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            onClick={() => { setRole("dev"); setScreen(screens.devDashboard); }}
            style={{ flex: 1, padding: 14, borderRadius: 10, border: `2px solid ${role === "dev" ? c.accent : c.border}`, background: role === "dev" ? c.accentGlow : "transparent", textAlign: "center", cursor: "pointer" }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>💻</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: role === "dev" ? c.accent : c.textDim }}>개발자 모드</div>
          </div>
          <div
            onClick={() => { setRole("tester"); setScreen(screens.testerHome); }}
            style={{ flex: 1, padding: 14, borderRadius: 10, border: `2px solid ${role === "tester" ? c.green : c.border}`, background: role === "tester" ? c.greenGlow : "transparent", textAlign: "center", cursor: "pointer" }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>🔍</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: role === "tester" ? c.green : c.textDim }}>테스터 모드</div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>알림 설정</div>
        {[
          { key: "push", label: "푸시 알림", desc: "선정, 테스트 시작/종료, 리워드 지급" },
          { key: "email", label: "이메일 알림", desc: "주요 알림을 이메일로 수신" },
          { key: "sms", label: "SMS 알림", desc: "긴급 알림만 문자로 수신" },
        ].map((n) => (
          <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{n.label}</div>
              <div style={{ fontSize: 11, color: c.textDim }}>{n.desc}</div>
            </div>
            <div
              onClick={() => setNotiSettings({ ...notiSettings, [n.key]: !notiSettings[n.key] })}
              style={{ width: 44, height: 24, borderRadius: 12, background: notiSettings[n.key] ? c.accent : c.border, padding: 2, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center" }}
            >
              <div style={{ width: 20, height: 20, borderRadius: 10, background: "#fff", transition: "all 0.2s", transform: notiSettings[n.key] ? "translateX(20px)" : "translateX(0)" }} />
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>결제 수단</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 24, borderRadius: 4, background: "#1A1F71", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>VISA</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>**** **** **** 4242</div>
              <div style={{ fontSize: 11, color: c.textDim }}>만료 12/27</div>
            </div>
          </div>
          <Badge color={c.green} glow={c.greenGlow}>기본</Badge>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button small style={{ flex: 1 }}>카드 추가</Button>
          <Button small style={{ flex: 1 }}>토스페이 연결</Button>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>결제 내역</div>
        {[
          { date: "02.25", desc: "Basic 구독 (3월)", amount: "19,900원" },
          { date: "02.20", desc: "FitTracker 테스터 리워드", amount: "82,500원" },
          { date: "01.25", desc: "Basic 구독 (2월)", amount: "19,900원" },
        ].map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 10, borderBottom: i < 2 ? `1px solid ${c.border}` : "none" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{p.desc}</div>
              <div style={{ fontSize: 11, color: c.textDim }}>{p.date}</div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{p.amount}</span>
          </div>
        ))}
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        <div onClick={() => setScreen(screens.cs)} style={{ fontSize: 13, color: c.textDim, cursor: "pointer", padding: "10px 0", borderBottom: `1px solid ${c.border}` }}>고객센터 / 문의하기</div>
        <div style={{ fontSize: 13, color: c.textDim, cursor: "pointer", padding: "10px 0", borderBottom: `1px solid ${c.border}` }}>이용약관</div>
        <div style={{ fontSize: 13, color: c.textDim, cursor: "pointer", padding: "10px 0", borderBottom: `1px solid ${c.border}` }}>개인정보처리방침</div>
        <div style={{ fontSize: 13, color: c.red, cursor: "pointer", padding: "10px 0", borderBottom: `1px solid ${c.border}` }}>로그아웃</div>
        <div style={{ fontSize: 13, color: c.textMuted, cursor: "pointer", padding: "10px 0" }}>회원탈퇴</div>
      </div>
    </div>
  );
};

// ============ SCREENS ============

const LandingScreen = ({ setScreen, setRole }) => (
  <div style={{ padding: "60px 24px", textAlign: "center" }}>
    <div style={{ marginBottom: 16 }}>
      <Badge color={c.green} glow={c.greenGlow}>Google Play 비공개 테스트 특화</Badge>
    </div>
    <h1
      style={{
        fontSize: 40,
        fontWeight: 900,
        color: c.text,
        lineHeight: 1.2,
        marginBottom: 16,
        letterSpacing: -1,
      }}
    >
      앱 테스터를
      <br />
      <span style={{ color: c.accent }}>14일 안에</span> 모집하세요
    </h1>
    <p style={{ color: c.textDim, fontSize: 16, lineHeight: 1.6, maxWidth: 420, margin: "0 auto 36px" }}>
      개발자와 테스터를 연결하는 매칭 플랫폼.
      <br />
      Google Play 프로덕션 등록을 위한 가장 빠른 방법.
    </p>
    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 60 }}>
      <Button primary onClick={() => { setScreen(screens.signup); }}>
        개발자로 시작
      </Button>
      <Button onClick={() => { setScreen(screens.signup); }}>
        테스터로 시작
      </Button>
    </div>

    <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", maxWidth: 700, margin: "0 auto" }}>
      {[
        { icon: "📱", title: "앱 등록", desc: "앱 정보와 스크린샷으로 간단 등록" },
        { icon: "👥", title: "테스터 매칭", desc: "조건에 맞는 테스터 자동 추천" },
        { icon: "📊", title: "실시간 추적", desc: "14일 옵트인 현황 대시보드" },
        { icon: "💰", title: "리워드 지급", desc: "테스트 완료 시 자동 정산" },
      ].map((item) => (
        <Card key={item.title} style={{ flex: "1 1 140px", minWidth: 140, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 6 }}>
            {item.title}
          </div>
          <div style={{ fontSize: 12, color: c.textDim, lineHeight: 1.5 }}>{item.desc}</div>
        </Card>
      ))}
    </div>
  </div>
);

const DevDashboard = ({ setScreen }) => (
  <div style={{ padding: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text, margin: 0 }}>대시보드</h2>
        <p style={{ color: c.textDim, fontSize: 13, margin: "4px 0 0" }}>진행 중인 테스트 3건</p>
      </div>
      <Button primary onClick={() => setScreen(screens.appRegister)}>+ 새 앱 등록</Button>
    </div>

    <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
      {[
        { label: "진행 중", value: "3", color: c.accent },
        { label: "모집 중", value: "1", color: c.orange },
        { label: "완료", value: "12", color: c.green },
        { label: "크레딧", value: "140", color: c.purple },
      ].map((s) => (
        <Card key={s.label} style={{ flex: "1 1 70px", minWidth: 70, textAlign: "center", padding: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 11, color: c.textDim, marginTop: 4 }}>{s.label}</div>
        </Card>
      ))}
    </div>

    <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 14 }}>진행 중인 테스트</h3>
    {[
      { name: "FitTracker", emoji: "🏃", day: 11, testers: 18, target: 20, status: "진행 중" },
      { name: "StudyMate", emoji: "📚", day: 5, testers: 22, target: 20, status: "진행 중" },
      { name: "CookNote", emoji: "🍳", day: 0, testers: 8, target: 20, status: "모집 중" },
    ].map((app) => (
      <Card
        key={app.name}
        onClick={() => setScreen(screens.appDetail)}
        style={{ marginBottom: 12, cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <AppIcon emoji={app.emoji} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>{app.name}</span>
              <Badge
                color={app.status === "모집 중" ? c.orange : c.accent}
                glow={app.status === "모집 중" ? c.orangeGlow : c.accentGlow}
              >
                {app.status}
              </Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: c.textDim }}>
                {app.day > 0 ? `D+${app.day} / 14일` : "테스터 모집 중"}
              </span>
              <span style={{ fontSize: 12, color: c.textDim }}>
                {app.testers}/{app.target}명
              </span>
            </div>
            <ProgressBar value={app.day > 0 ? app.day : app.testers} max={app.day > 0 ? 14 : app.target} color={app.status === "모집 중" ? c.orange : c.accent} />
          </div>
        </div>
      </Card>
    ))}

    <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "24px 0 14px" }}>최근 피드백</h3>
    {[
      { app: "FitTracker", user: "tester_kim", msg: "운동 기록 화면에서 가끔 렉이 걸려요", rating: 4 },
      { app: "StudyMate", user: "dev_park", msg: "UI가 깔끔하고 사용하기 편합니다!", rating: 5 },
    ].map((fb, i) => (
      <Card key={i} style={{ marginBottom: 10, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{fb.app}</span>
          <span style={{ fontSize: 12, color: c.orange }}>{"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}</span>
        </div>
        <p style={{ fontSize: 13, color: c.textDim, margin: 0, lineHeight: 1.5 }}>{fb.msg}</p>
        <span style={{ fontSize: 11, color: c.textMuted, marginTop: 6, display: "block" }}>@{fb.user}</span>
      </Card>
    ))}
  </div>
);

const AppRegister = ({ setScreen }) => {
  const [step, setStep] = useState(1);
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => setScreen(screens.devDashboard)} style={{ background: "none", border: "none", color: c.textDim, fontSize: 18, cursor: "pointer" }}>←</button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: 0 }}>새 앱 등록</h2>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {["기본 정보", "테스트 설정", "리워드", "피드백"].map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                background: step > i ? c.accent : step === i + 1 ? c.accentGlow : c.border,
                color: step > i ? "#fff" : step === i + 1 ? c.accent : c.textMuted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                margin: "0 auto 6px",
                border: step === i + 1 ? `2px solid ${c.accent}` : "none",
              }}
            >
              {step > i ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: 11, color: step === i + 1 ? c.text : c.textMuted }}>{s}</div>
          </div>
        ))}
      </div>

      <Card>
        {step === 1 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 20 }}>기본 정보</h3>
            {[
              { label: "앱 이름", placeholder: "예: FitTracker", type: "text" },
              { label: "패키지명", placeholder: "com.example.fittracker", type: "text" },
              { label: "카테고리", placeholder: "건강/피트니스", type: "select" },
              { label: "앱 설명", placeholder: "운동 기록 및 분석 앱입니다...", type: "textarea" },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>
                  {f.label}
                </label>
                {f.type === "textarea" ? (
                  <div style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, boxSizing: "border-box", padding: 12, color: c.textMuted, fontSize: 13 }}>
                    {f.placeholder}
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, boxSizing: "border-box", padding: "0 12px", display: "flex", alignItems: "center", color: c.textMuted, fontSize: 13 }}>
                    {f.placeholder}
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>앱 아이콘</label>
              <div style={{ width: 72, height: 72, borderRadius: 16, border: `2px dashed ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.textMuted, fontSize: 24 }}>+</div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>스크린샷 (최대 5장)</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={{ width: 60, height: 100, borderRadius: 8, border: `2px dashed ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.textMuted, fontSize: 18 }}>+</div>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 20 }}>테스트 설정</h3>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 10 }}>테스트 유형</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["💰 유료 리워드", "🔄 상호 테스트"].map((t, i) => (
                  <div key={t} style={{ flex: 1, padding: 14, borderRadius: 10, border: `2px solid ${i === 0 ? c.accent : c.border}`, background: i === 0 ? c.accentGlow : "transparent", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? c.accent : c.textDim }}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>필요 테스터 수</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 120, height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.text, fontSize: 15, fontWeight: 700 }}>25명</div>
                <span style={{ fontSize: 12, color: c.textDim }}>최소 20명 권장</span>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>테스트 기간</label>
              <div style={{ height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", padding: "0 12px", color: c.text, fontSize: 14 }}>14일 (필수)</div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>Google Play 비공개 테스트 링크</label>
              <div style={{ height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", padding: "0 12px", color: c.textMuted, fontSize: 13 }}>https://play.google.com/apps/testing/...</div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 20 }}>리워드 설정</h3>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 10 }}>리워드 유형</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { name: "기본", desc: "14일 옵트인 유지", price: "1,000 ~ 2,000원", selected: false },
                  { name: "피드백 포함", desc: "옵트인 + 피드백 작성", price: "2,000 ~ 4,000원", selected: true },
                  { name: "심화", desc: "옵트인 + 리뷰 + 버그리포트", price: "4,000 ~ 8,000원", selected: false },
                ].map((r) => (
                  <div key={r.name} style={{ padding: 14, borderRadius: 10, border: `2px solid ${r.selected ? c.accent : c.border}`, background: r.selected ? c.accentGlow : "transparent", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: r.selected ? c.accent : c.text }}>{r.name}</span>
                        <span style={{ fontSize: 12, color: c.textDim, marginLeft: 8 }}>{r.desc}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: r.selected ? c.accent : c.textDim }}>{r.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>1인당 리워드 금액</label>
              <div style={{ height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", padding: "0 12px", color: c.text, fontSize: 15, fontWeight: 700 }}>3,000원</div>
            </div>
            <Card style={{ background: c.bg, marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 12 }}>예상 비용</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: c.textDim, marginBottom: 6 }}>
                <span>테스터 리워드 (25명 × 3,000원)</span><span style={{ color: c.text }}>75,000원</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: c.textDim, marginBottom: 6 }}>
                <span>플랫폼 수수료 (10%)</span><span style={{ color: c.text }}>7,500원</span>
              </div>
              <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 10, marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: c.accent }}>
                <span>총 비용</span><span>82,500원</span>
              </div>
            </Card>
          </div>
        )}
        {step === 4 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 20 }}>피드백 설정</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 10 }}>피드백 필수 여부</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["필수", "선택"].map((t, i) => (
                  <div key={t} style={{ flex: 1, padding: 10, borderRadius: 8, border: `2px solid ${i === 0 ? c.accent : c.border}`, textAlign: "center", cursor: "pointer" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? c.accent : c.textDim }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 10 }}>평가 항목</label>
              {["UI/UX", "성능/속도", "기능 완성도", "안정성"].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: c.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>✓</div>
                  <span style={{ fontSize: 13, color: c.text }}>{item}</span>
                </div>
              ))}
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>테스트 가이드 (테스터에게 전달)</label>
              <div style={{ width: "100%", height: 100, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, padding: 12, color: c.textMuted, fontSize: 13, lineHeight: 1.6, boxSizing: "border-box" }}>
                1. 앱 설치 후 회원가입을 진행해주세요.{"\n"}
                2. 운동 기록 기능을 3일 이상 사용해주세요.{"\n"}
                3. 버그 발견 시 스크린샷과 함께 제보해주세요.
              </div>
            </div>
          </div>
        )}
      </Card>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <Button onClick={() => step > 1 && setStep(step - 1)} style={{ visibility: step === 1 ? "hidden" : "visible" }}>← 이전</Button>
        {step < 4 ? (
          <Button primary onClick={() => setStep(step + 1)}>다음 →</Button>
        ) : (
          <Button primary onClick={() => setScreen(screens.devDashboard)}>등록하기 ✓</Button>
        )}
      </div>
    </div>
  );
};

const AppDetail = ({ setScreen }) => {
  const [tab, setTab] = useState("현황");
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => setScreen(screens.devDashboard)} style={{ background: "none", border: "none", color: c.textDim, fontSize: 18, cursor: "pointer" }}>←</button>
        <AppIcon emoji="🏃" size={36} />
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: c.text, margin: 0 }}>FitTracker</h2>
          <span style={{ fontSize: 12, color: c.textDim }}>com.example.fittracker</span>
        </div>
        <Badge color={c.accent}>진행 중</Badge>
      </div>

      <TabBar tabs={["현황", "지원자", "참여자", "피드백", "가이드"]} active={tab} onSelect={setTab} />

      {tab === "현황" && (
        <div>
          <Card style={{ marginBottom: 16, background: `linear-gradient(135deg, ${c.accentGlow}, ${c.card})` }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: c.accent }}>D+11</div>
              <div style={{ fontSize: 13, color: c.textDim }}>14일 중 11일차</div>
            </div>
            <ProgressBar value={11} max={14} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: c.textDim }}>
              <span>시작 2/16</span><span>종료 3/2</span>
            </div>
          </Card>

          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <Card style={{ flex: 1, textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: c.green }}>18</div>
              <div style={{ fontSize: 11, color: c.textDim }}>옵트인 유지</div>
            </Card>
            <Card style={{ flex: 1, textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: c.red }}>2</div>
              <div style={{ fontSize: 11, color: c.textDim }}>이탈</div>
            </Card>
            <Card style={{ flex: 1, textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: c.orange }}>3</div>
              <div style={{ fontSize: 11, color: c.textDim }}>대기열</div>
            </Card>
          </div>

          <Card style={{ borderColor: c.red + "44", background: c.redGlow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: c.red }}>이탈 알림</div>
                <div style={{ fontSize: 12, color: c.textDim }}>tester_lee님이 앱을 삭제했습니다. 대기열에서 자동 교체됩니다.</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "지원자" && (
        <div>
          {[
            { name: "tester_choi", score: 92, tests: 15, badge: "골드" },
            { name: "tester_yoon", score: 78, tests: 8, badge: "실버" },
            { name: "dev_song", score: 65, tests: 4, badge: "브론즈" },
          ].map((t) => (
            <Card key={t.name} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: c.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>@{t.name}</div>
                    <div style={{ fontSize: 12, color: c.textDim }}>
                      신뢰도 {t.score}점 · {t.tests}회 참여 ·{" "}
                      <span style={{ color: t.badge === "골드" ? c.orange : t.badge === "실버" ? c.textDim : "#CD7F32" }}>{t.badge}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button small primary>승인</Button>
                  <Button small>거절</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "참여자" && (
        <div>
          {[
            { name: "tester_kim", status: "활성", lastRun: "오늘 14:23", day: 11 },
            { name: "tester_park", status: "활성", lastRun: "오늘 09:15", day: 11 },
            { name: "tester_lee", status: "이탈", lastRun: "2일 전", day: 9 },
          ].map((t) => (
            <Card key={t.name} style={{ marginBottom: 10, borderColor: t.status === "이탈" ? c.red + "44" : c.border }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, background: t.status === "활성" ? c.green : c.red }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>@{t.name}</div>
                    <div style={{ fontSize: 12, color: c.textDim }}>최근 실행: {t.lastRun} · {t.day}일차</div>
                  </div>
                </div>
                <Badge
                  color={t.status === "활성" ? c.green : c.red}
                  glow={t.status === "활성" ? c.greenGlow : c.redGlow}
                >
                  {t.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "피드백" && (
        <div>
          <Card style={{ marginBottom: 16, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: c.textDim, marginBottom: 6 }}>평균 평점</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.orange }}>4.2 <span style={{ fontSize: 14 }}>/ 5.0</span></div>
            <div style={{ fontSize: 14, color: c.orange, marginTop: 4 }}>★★★★☆</div>
          </Card>
          {[
            { user: "tester_kim", rating: 4, msg: "운동 기록은 좋은데 차트가 좀 느려요", type: "피드백" },
            { user: "tester_park", rating: 5, msg: "깔끔하고 좋습니다!", type: "피드백" },
            { user: "tester_choi", rating: 3, msg: "갤럭시 S21에서 스플래시 화면 깨짐", type: "버그" },
          ].map((fb, i) => (
            <Card key={i} style={{ marginBottom: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>@{fb.user}</span>
                  <Badge
                    color={fb.type === "버그" ? c.red : c.accent}
                    glow={fb.type === "버그" ? c.redGlow : c.accentGlow}
                  >
                    {fb.type}
                  </Badge>
                </div>
                <span style={{ fontSize: 12, color: c.orange }}>{"★".repeat(fb.rating)}</span>
              </div>
              <p style={{ fontSize: 13, color: c.textDim, margin: 0, lineHeight: 1.5 }}>{fb.msg}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === "가이드" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 16 }}>프로덕션 등록 체크리스트</h4>
            {[
              { text: "12명 이상 14일 옵트인 유지", done: true },
              { text: "테스터 피드백 수집 완료", done: true },
              { text: "피드백 반영 및 앱 업데이트", done: false },
              { text: "프로덕션 액세스 신청", done: false },
              { text: "Google 질문 답변 작성", done: false },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: item.done ? c.green : c.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>
                  {item.done ? "✓" : ""}
                </div>
                <span style={{ fontSize: 13, color: item.done ? c.text : c.textDim, textDecoration: item.done ? "line-through" : "none" }}>{item.text}</span>
              </div>
            ))}
          </Card>
          <Button primary style={{ width: "100%" }}>프로덕션 등록 완료 확인 → 리워드 지급</Button>
        </div>
      )}
    </div>
  );
};

const TesterHome = ({ setScreen }) => (
  <div style={{ padding: 24 }}>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 4 }}>앱 탐색</h2>
    <p style={{ color: c.textDim, fontSize: 13, marginBottom: 20 }}>테스트하고 리워드를 받으세요</p>

    <div style={{ height: 40, borderRadius: 10, border: `1px solid ${c.border}`, background: c.card, display: "flex", alignItems: "center", padding: "0 14px", marginBottom: 16, color: c.textMuted, fontSize: 13 }}>
      🔍  앱 이름 또는 카테고리 검색...
    </div>

    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
      {["전체", "💰 고리워드", "🔄 상호테스트", "🎮 게임", "📱 유틸리티", "🏃 건강"].map((f, i) => (
        <div key={f} style={{ padding: "6px 14px", borderRadius: 20, background: i === 0 ? c.accent : c.card, border: `1px solid ${i === 0 ? c.accent : c.border}`, color: i === 0 ? "#fff" : c.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          {f}
        </div>
      ))}
    </div>

    {[
      { name: "FitTracker", emoji: "🏃", cat: "건강/피트니스", reward: "3,000원", spots: "5/25", desc: "운동 기록 및 분석 앱" },
      { name: "StudyMate", emoji: "📚", cat: "교육", reward: "2,000원", spots: "12/20", desc: "공부 시간 관리 타이머" },
      { name: "CookNote", emoji: "🍳", cat: "요리/레시피", reward: "상호 테스트", spots: "8/20", desc: "나만의 레시피 저장소", credit: true },
      { name: "PetDiary", emoji: "🐕", cat: "라이프스타일", reward: "5,000원", spots: "3/25", desc: "반려동물 건강 기록", hot: true },
    ].map((app) => (
      <Card key={app.name} onClick={() => setScreen(screens.testerAppDetail)} style={{ marginBottom: 12, cursor: "pointer" }}>
        <div style={{ display: "flex", gap: 14 }}>
          <AppIcon emoji={app.emoji} size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>{app.name}</span>
                  {app.hot && <Badge color={c.red} glow={c.redGlow}>HOT</Badge>}
                </div>
                <span style={{ fontSize: 12, color: c.textDim }}>{app.cat}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: app.credit ? c.purple : c.green }}>{app.reward}</div>
                <div style={{ fontSize: 11, color: c.textDim }}>/1인</div>
              </div>
            </div>
            <p style={{ fontSize: 12, color: c.textDim, margin: "6px 0", lineHeight: 1.4 }}>{app.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: c.textMuted }}>남은 자리 {app.spots}</span>
              <ProgressBar value={parseInt(app.spots)} max={parseInt(app.spots.split("/")[1])} color={c.green} />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const TesterAppDetail = ({ setScreen }) => (
  <div style={{ padding: 24 }}>
    <button onClick={() => setScreen(screens.testerHome)} style={{ background: "none", border: "none", color: c.textDim, fontSize: 18, cursor: "pointer", marginBottom: 20 }}>← 뒤로</button>

    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <AppIcon emoji="🐕" size={72} />
      <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text, margin: "12px 0 4px" }}>PetDiary</h2>
      <span style={{ fontSize: 13, color: c.textDim }}>라이프스타일 · @dev_hong</span>
    </div>

    <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto" }}>
      {[1, 2, 3].map((n) => (
        <div key={n} style={{ width: 120, height: 210, borderRadius: 12, background: `linear-gradient(180deg, ${c.accent}15, ${c.purple}15)`, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.textMuted, fontSize: 12, flexShrink: 0 }}>
          스크린샷 {n}
        </div>
      ))}
    </div>

    <Card style={{ marginBottom: 16 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 10 }}>앱 소개</h4>
      <p style={{ fontSize: 13, color: c.textDim, lineHeight: 1.6, margin: 0 }}>
        반려동물의 건강 상태, 산책 기록, 예방접종 일정을 한곳에서 관리하세요.
        사료 급여량 계산, 체중 변화 그래프, 동물병원 방문 기록까지 제공합니다.
      </p>
    </Card>

    <Card style={{ marginBottom: 16 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 12 }}>테스트 정보</h4>
      {[
        { label: "테스트 기간", value: "14일" },
        { label: "리워드", value: "5,000원 / 1인", color: c.green },
        { label: "리워드 조건", value: "옵트인 유지 + 피드백 작성" },
        { label: "남은 자리", value: "22 / 25명" },
        { label: "피드백", value: "필수 (UI/UX, 안정성)" },
      ].map((info) => (
        <div key={info.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: c.textDim }}>{info.label}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: info.color || c.text }}>{info.value}</span>
        </div>
      ))}
    </Card>

    <Card style={{ marginBottom: 20 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 10 }}>테스트 가이드</h4>
      <p style={{ fontSize: 13, color: c.textDim, lineHeight: 1.6, margin: 0 }}>
        1. 앱 설치 후 반려동물 프로필을 등록해주세요.{"\n"}
        2. 산책 기록 기능을 3회 이상 사용해주세요.{"\n"}
        3. 버그 발견 시 스크린샷과 함께 제보해주세요.
      </p>
    </Card>

    <Button primary style={{ width: "100%", padding: "14px 0", fontSize: 16 }}>테스트 지원하기</Button>
  </div>
);

const TesterMyTests = ({ setScreen }) => {
  const [tab, setTab] = useState("진행 중");
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 4 }}>내 테스트</h2>
      <p style={{ color: c.textDim, fontSize: 13, marginBottom: 16 }}>참여 중인 테스트를 관리하세요</p>

      <TabBar tabs={["진행 중", "완료", "지원 대기"]} active={tab} onSelect={setTab} />

      {tab === "진행 중" && (
        <div>
          {[
            { name: "FitTracker", emoji: "🏃", day: 11, reward: "3,000원", ranToday: true },
            { name: "StudyMate", emoji: "📚", day: 5, reward: "2,000원", ranToday: false },
          ].map((app) => (
            <Card key={app.name} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <AppIcon emoji={app.emoji} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>{app.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: c.green }}>{app.reward}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: c.textDim }}>D+{app.day} / 14일</span>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: app.ranToday ? c.green : c.orange }} />
                    <span style={{ fontSize: 11, color: app.ranToday ? c.green : c.orange }}>
                      {app.ranToday ? "오늘 실행 완료" : "오늘 미실행"}
                    </span>
                  </div>
                  <ProgressBar value={app.day} max={14} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Button small style={{ flex: 1 }}>Google Play에서 열기</Button>
                <Button small primary style={{ flex: 1 }} onClick={() => setScreen(screens.feedback)}>피드백 작성</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "완료" && (
        <div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <AppIcon emoji="🎵" />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>MusicFlow</span>
                  <Badge color={c.green} glow={c.greenGlow}>리워드 지급 완료</Badge>
                </div>
                <span style={{ fontSize: 12, color: c.textDim }}>2,000원 · 2025.02.10 완료</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "지원 대기" && (
        <div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <AppIcon emoji="🐕" />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>PetDiary</span>
                  <Badge color={c.orange} glow={c.orangeGlow}>선정 대기</Badge>
                </div>
                <span style={{ fontSize: 12, color: c.textDim }}>5,000원 · 지원일 2025.02.25</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const FeedbackScreen = ({ setScreen }) => (
  <div style={{ padding: 24 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
      <button onClick={() => setScreen(screens.testerMyTests)} style={{ background: "none", border: "none", color: c.textDim, fontSize: 18, cursor: "pointer" }}>←</button>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: c.text, margin: 0 }}>피드백 작성</h2>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <AppIcon emoji="🏃" />
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: c.text }}>FitTracker</div>
        <div style={{ fontSize: 12, color: c.textDim }}>D+11 / 14일</div>
      </div>
    </div>

    <Card style={{ marginBottom: 16 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 16 }}>전체 만족도</h4>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} style={{ fontSize: 32, cursor: "pointer", color: n <= 4 ? c.orange : c.border }}>★</span>
        ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 13, color: c.textDim }}>4 / 5점</div>
    </Card>

    <Card style={{ marginBottom: 16 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 16 }}>항목별 평가</h4>
      {[
        { label: "UI/UX", score: 4 },
        { label: "성능/속도", score: 3 },
        { label: "기능 완성도", score: 4 },
        { label: "안정성", score: 5 },
      ].map((item) => (
        <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: c.text, width: 90 }}>{item.label}</span>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} style={{ fontSize: 18, color: n <= item.score ? c.orange : c.border, cursor: "pointer" }}>★</span>
            ))}
          </div>
        </div>
      ))}
    </Card>

    <Card style={{ marginBottom: 16 }}>
      <h4 style={{ fontSize: 14, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 10 }}>상세 피드백</h4>
      <div style={{ width: "100%", height: 100, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, padding: 12, boxSizing: "border-box", color: c.textMuted, fontSize: 13, lineHeight: 1.6 }}>
        앱에 대한 의견을 자유롭게 작성해주세요...
      </div>
    </Card>

    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: c.text, margin: 0 }}>버그 리포트</h4>
        <Badge color={c.textDim}>선택사항</Badge>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ height: 36, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", padding: "0 12px", color: c.textMuted, fontSize: 13 }}>
          버그 제목
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ width: "100%", height: 60, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, padding: 12, boxSizing: "border-box", color: c.textMuted, fontSize: 13 }}>
          재현 방법을 작성해주세요...
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ width: 60, height: 60, borderRadius: 8, border: `2px dashed ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.textMuted, fontSize: 11 }}>📷 첨부</div>
      </div>
    </Card>

    <Button primary style={{ width: "100%", padding: "14px 0", fontSize: 16 }} onClick={() => setScreen(screens.testerMyTests)}>피드백 제출하기</Button>
  </div>
);

const RewardScreen = ({ setScreen }) => {
  const [tab, setTab] = useState("포인트");
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 4 }}>리워드</h2>
      <p style={{ color: c.textDim, fontSize: 13, marginBottom: 20 }}>적립 내역과 출금을 관리하세요</p>

      <Card style={{ marginBottom: 20, background: `linear-gradient(135deg, ${c.greenGlow}, ${c.card})`, border: `1px solid ${c.green}33` }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: c.textDim, marginBottom: 6 }}>보유 포인트</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: c.green }}>15,000<span style={{ fontSize: 16, fontWeight: 600 }}>P</span></div>
          <div style={{ fontSize: 13, color: c.textDim, marginTop: 4 }}>= 15,000원</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Button primary style={{ flex: 1, background: c.green, fontSize: 13 }}>출금 신청</Button>
          <Button style={{ flex: 1, fontSize: 13 }}>기프티콘 교환</Button>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <Card style={{ flex: 1, textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: c.accent }}>7</div>
          <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>완료 테스트</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: c.green }}>28,000</div>
          <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>총 적립 (원)</div>
        </Card>
        <Card style={{ flex: 1, textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: c.orange }}>13,000</div>
          <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>총 출금 (원)</div>
        </Card>
      </div>

      <TabBar tabs={["포인트", "출금", "기프티콘"]} active={tab} onSelect={setTab} />

      {tab === "포인트" && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.textDim, marginBottom: 12 }}>적립/사용 내역</div>
          {[
            { date: "02.25", app: "FitTracker", type: "적립", amount: "+3,000", color: c.green, desc: "테스트 완료 리워드" },
            { date: "02.20", app: "출금", type: "출금", amount: "-5,000", color: c.red, desc: "계좌이체 (국민은행)" },
            { date: "02.18", app: "StudyMate", type: "적립", amount: "+2,000", color: c.green, desc: "테스트 완료 리워드" },
            { date: "02.15", app: "기프티콘", type: "교환", amount: "-3,000", color: c.orange, desc: "스타벅스 아메리카노" },
            { date: "02.10", app: "MusicFlow", type: "적립", amount: "+2,000", color: c.green, desc: "테스트 완료 리워드" },
            { date: "02.05", app: "QuizKing", type: "적립", amount: "+5,000", color: c.green, desc: "심화 테스트 리워드" },
            { date: "01.28", app: "출금", type: "출금", amount: "-8,000", color: c.red, desc: "계좌이체 (신한은행)" },
            { date: "01.20", app: "상호테스트", type: "적립", amount: "+30C", color: c.purple, desc: "크레딧 적립 (앱 3개 테스트)" },
          ].map((item, i) => (
            <Card key={i} style={{ marginBottom: 8, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: item.type === "적립" ? c.greenGlow : item.type === "출금" ? c.redGlow : c.orangeGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                    {item.type === "적립" ? "💰" : item.type === "출금" ? "🏦" : "🎁"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{item.app}</div>
                    <div style={{ fontSize: 11, color: c.textDim }}>{item.date} · {item.desc}</div>
                  </div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: item.color }}>{item.amount}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "출금" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: c.text, marginTop: 0, marginBottom: 16 }}>출금 신청</h4>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>출금 방식</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["🏦 계좌이체", "💳 PayPal"].map((m, i) => (
                  <div key={m} style={{ flex: 1, padding: 12, borderRadius: 8, border: `2px solid ${i === 0 ? c.accent : c.border}`, background: i === 0 ? c.accentGlow : "transparent", textAlign: "center", cursor: "pointer" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? c.accent : c.textDim }}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>은행 선택</label>
              <div style={{ height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", padding: "0 12px", color: c.textMuted, fontSize: 13 }}>
                은행을 선택하세요 ▾
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>계좌번호</label>
              <div style={{ height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", padding: "0 12px", color: c.textMuted, fontSize: 13 }}>
                계좌번호를 입력하세요
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>예금주</label>
              <div style={{ height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", padding: "0 12px", color: c.textMuted, fontSize: 13 }}>
                예금주명을 입력하세요
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>출금 금액</label>
              <div style={{ height: 44, borderRadius: 8, border: `1px solid ${c.accent}`, background: c.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 12px", color: c.accent, fontSize: 18, fontWeight: 800 }}>
                10,000원
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: c.textDim }}>최소 출금: 10,000원</span>
                <span style={{ fontSize: 11, color: c.textDim }}>보유: 15,000P</span>
              </div>
            </div>

            <Card style={{ background: c.bg, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: c.textDim, marginBottom: 6 }}>
                <span>출금 금액</span><span style={{ color: c.text }}>10,000원</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: c.textDim, marginBottom: 6 }}>
                <span>출금 수수료</span><span style={{ color: c.text }}>0원</span>
              </div>
              <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 10, marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: c.green }}>
                <span>실수령액</span><span>10,000원</span>
              </div>
            </Card>

            <Button primary style={{ width: "100%", padding: "12px 0" }}>출금 신청하기</Button>
          </Card>

          <div style={{ fontSize: 13, fontWeight: 600, color: c.textDim, marginBottom: 12 }}>출금 내역</div>
          {[
            { date: "02.20", amount: "5,000원", status: "완료", account: "국민 ****1234" },
            { date: "01.28", amount: "8,000원", status: "완료", account: "신한 ****5678" },
          ].map((w, i) => (
            <Card key={i} style={{ marginBottom: 8, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{w.amount}</div>
                  <div style={{ fontSize: 11, color: c.textDim }}>{w.date} · {w.account}</div>
                </div>
                <Badge color={c.green} glow={c.greenGlow}>{w.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "기프티콘" && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: c.textDim, marginBottom: 12 }}>교환 가능 기프티콘</div>
          {[
            { name: "스타벅스 아메리카노", price: "4,500P", emoji: "☕", brand: "스타벅스" },
            { name: "CU 5,000원 상품권", price: "5,000P", emoji: "🏪", brand: "CU" },
            { name: "배달의민족 10,000원", price: "10,000P", emoji: "🍕", brand: "배달의민족" },
            { name: "카카오 이모티콘 선물", price: "3,000P", emoji: "💬", brand: "카카오" },
            { name: "네이버페이 5,000원", price: "5,000P", emoji: "💚", brand: "네이버" },
            { name: "CGV 영화 관람권", price: "12,000P", emoji: "🎬", brand: "CGV" },
          ].map((g, i) => (
            <Card key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: c.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{g.emoji}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: c.textDim }}>{g.brand}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: c.purple, marginBottom: 4 }}>{g.price}</div>
                  <Button small primary style={{ padding: "4px 12px", fontSize: 11 }}>교환</Button>
                </div>
              </div>
            </Card>
          ))}

          <div style={{ fontSize: 13, fontWeight: 600, color: c.textDim, margin: "20px 0 12px" }}>교환 내역</div>
          <Card style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>☕</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>스타벅스 아메리카노</div>
                  <div style={{ fontSize: 11, color: c.textDim }}>02.15 · -3,000P</div>
                </div>
              </div>
              <Badge color={c.green} glow={c.greenGlow}>발송 완료</Badge>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ============ CUSTOMER SERVICE ============

const CSScreen = ({ setScreen, role }) => {
  const [tab, setTab] = useState("문의하기");
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const faqs = [
    { cat: "테스트", q: "14일 동안 매일 앱을 실행해야 하나요?", a: "네, Google Play 정책상 14일 연속으로 옵트인 상태를 유지해야 합니다. 앱을 삭제하거나 옵트아웃하면 카운트가 초기화됩니다. 하루 1회 이상 앱을 실행하는 것을 권장합니다." },
    { cat: "테스트", q: "테스터가 중간에 이탈하면 어떻게 되나요?", a: "이탈 시 대기열의 다음 테스터가 자동으로 교체됩니다. 단, 이탈한 테스터는 신뢰도 점수가 하락하며 향후 매칭에서 불이익을 받을 수 있습니다. 개발자에게는 이탈 즉시 알림이 발송됩니다." },
    { cat: "테스트", q: "20명 중 몇 명이 유지되어야 프로덕션 등록이 가능한가요?", a: "Google Play 정책상 최소 12명 이상이 14일 연속 옵트인을 유지해야 합니다. TestBridge에서는 이탈을 대비해 20~25명 모집을 권장하고 있습니다." },
    { cat: "리워드", q: "리워드는 언제 지급되나요?", a: "개발자가 프로덕션 등록 완료를 확인한 후 24시간 이내에 포인트로 지급됩니다. 포인트는 현금 출금(최소 10,000원) 또는 기프티콘 교환이 가능합니다." },
    { cat: "리워드", q: "출금은 얼마부터 가능한가요?", a: "최소 출금 금액은 10,000원이며, 계좌이체 또는 PayPal로 출금 가능합니다. 출금 수수료는 무료이며, 영업일 기준 1~3일 내 입금됩니다." },
    { cat: "리워드", q: "상호 테스트 크레딧은 어떻게 작동하나요?", a: "다른 개발자의 앱을 테스트하면 크레딧을 적립할 수 있습니다. 앱 1개 테스트 완료 시 20크레딧이 적립되며, 자신의 앱을 등록할 때 50크레딧을 사용합니다. 무료로 테스터를 모집할 수 있는 방법입니다." },
    { cat: "결제", q: "구독을 해지하면 진행 중인 테스트는 어떻게 되나요?", a: "이미 진행 중인 테스트는 구독 해지 후에도 정상적으로 완료됩니다. 다만 해지 후에는 Free 플랜으로 전환되어 새 앱 등록이 월 1개로 제한됩니다." },
    { cat: "결제", q: "환불 정책은 어떻게 되나요?", a: "구독료는 결제일로부터 7일 이내 전액 환불 가능합니다. 건별 결제의 경우 테스터 매칭 시작 전까지 전액 환불, 매칭 시작 후에는 미사용 리워드분만 환불됩니다." },
    { cat: "계정", q: "개발자와 테스터 역할을 동시에 할 수 있나요?", a: "네, 회원가입 시 '둘 다'를 선택하거나 마이페이지에서 역할 전환이 가능합니다. 상단 토글로 언제든 개발자/테스터 모드를 전환할 수 있습니다." },
    { cat: "계정", q: "회원탈퇴하면 데이터는 어떻게 되나요?", a: "탈퇴 시 개인정보는 즉시 삭제됩니다. 단, 진행 중인 테스트가 있는 경우 완료 후 탈퇴가 가능하며, 미출금 포인트는 탈퇴 전 반드시 출금해주세요." },
  ];

  const filteredFaqs = selectedCategory ? faqs.filter((f) => f.cat === selectedCategory) : faqs;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => setScreen(role === "tester" ? screens.testerHome : screens.devDashboard)} style={{ background: "none", border: "none", color: c.textDim, fontSize: 18, cursor: "pointer" }}>←</button>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text, margin: 0 }}>고객센터</h2>
      </div>

      <TabBar tabs={["문의하기", "FAQ", "공지사항", "내 문의"]} active={tab} onSelect={setTab} />

      {tab === "문의하기" && (
        <div>
          <Card style={{ marginBottom: 16, background: `linear-gradient(135deg, ${c.accentGlow}, ${c.card})`, border: `1px solid ${c.accent}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 28 }}>💬</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.text }}>무엇을 도와드릴까요?</div>
                <div style={{ fontSize: 12, color: c.textDim, marginTop: 2 }}>평일 09:00~18:00 | 평균 응답 2시간</div>
              </div>
            </div>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>문의 유형</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {[
                { icon: "🐛", label: "버그 신고" },
                { icon: "💳", label: "결제/환불" },
                { icon: "👤", label: "계정 문제" },
                { icon: "🔔", label: "테스트 관련" },
                { icon: "💰", label: "리워드/출금" },
                { icon: "📢", label: "신고/제보" },
                { icon: "💡", label: "기능 제안" },
                { icon: "❓", label: "기타" },
              ].map((type) => (
                <div key={type.label} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${c.border}`, background: c.card, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{type.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{type.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>문의 작성</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.textDim, display: "block", marginBottom: 6 }}>제목</label>
              <div style={{ height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", padding: "0 12px", color: c.textMuted, fontSize: 13 }}>
                문의 제목을 입력하세요
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.textDim, display: "block", marginBottom: 6 }}>관련 앱 (선택)</label>
              <div style={{ height: 40, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, display: "flex", alignItems: "center", padding: "0 12px", color: c.textMuted, fontSize: 13 }}>
                앱을 선택하세요 ▾
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.textDim, display: "block", marginBottom: 6 }}>문의 내용</label>
              <div style={{ width: "100%", height: 120, borderRadius: 8, border: `1px solid ${c.border}`, background: c.bg, padding: 12, boxSizing: "border-box", color: c.textMuted, fontSize: 13, lineHeight: 1.6 }}>
                문의 내용을 상세히 작성해주세요...
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.textDim, display: "block", marginBottom: 6 }}>첨부파일</label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 60, height: 60, borderRadius: 8, border: `2px dashed ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: c.textMuted, fontSize: 11, flexDirection: "column", gap: 2, cursor: "pointer" }}>
                  <span style={{ fontSize: 18 }}>📎</span>
                  <span>첨부</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>이미지, PDF (최대 10MB)</div>
            </div>
            <Button primary style={{ width: "100%", padding: "12px 0" }}>문의 제출하기</Button>
          </Card>

          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 12 }}>빠른 연락</div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { icon: "📧", label: "이메일", value: "support@testbridge.kr" },
                { icon: "💬", label: "카카오톡", value: "@TestBridge" },
              ].map((contact) => (
                <div key={contact.label} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${c.border}`, textAlign: "center", cursor: "pointer" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{contact.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{contact.label}</div>
                  <div style={{ fontSize: 11, color: c.accent, marginTop: 2 }}>{contact.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "FAQ" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[null, "테스트", "리워드", "결제", "계정"].map((cat) => (
              <div
                key={cat || "전체"}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: selectedCategory === cat ? c.accent : c.card,
                  border: `1px solid ${selectedCategory === cat ? c.accent : c.border}`,
                  color: selectedCategory === cat ? "#fff" : c.textDim,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {cat || "전체"}
              </div>
            ))}
          </div>
          {filteredFaqs.map((faq, i) => (
            <Card
              key={i}
              onClick={() => setSelectedFaq(selectedFaq === i ? null : i)}
              style={{ marginBottom: 8, cursor: "pointer", padding: 16 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <Badge color={faq.cat === "테스트" ? c.accent : faq.cat === "리워드" ? c.green : faq.cat === "결제" ? c.orange : c.purple} glow={faq.cat === "테스트" ? c.accentGlow : faq.cat === "리워드" ? c.greenGlow : faq.cat === "결제" ? c.orangeGlow : `${c.purple}22`}>
                    {faq.cat}
                  </Badge>
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{faq.q}</span>
                </div>
                <span style={{ fontSize: 14, color: c.textDim, transform: selectedFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
              </div>
              {selectedFaq === i && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${c.border}`, fontSize: 13, color: c.textDim, lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "공지사항" && (
        <div>
          {[
            { date: "02.27", title: "TestBridge 오픈 베타 출시!", badge: "중요", color: c.red, content: "안녕하세요, TestBridge입니다. 오늘 오픈 베타를 시작합니다! 베타 기간 동안 모든 사용자에게 Basic 플랜을 무료로 제공합니다." },
            { date: "02.25", title: "서비스 이용약관 개정 안내", badge: "공지", color: c.accent, content: "3월 1일부터 적용되는 이용약관 개정 사항을 안내드립니다. 주요 변경 내용: 리워드 지급 기준 명확화, 이탈 페널티 정책 추가." },
            { date: "02.20", title: "리워드 출금 기능 업데이트", badge: "업데이트", color: c.green, content: "카카오뱅크, 토스뱅크 계좌 출금이 추가되었습니다. 출금 처리 시간도 기존 3일에서 1일로 단축되었습니다." },
            { date: "02.15", title: "신규 기프티콘 추가 안내", badge: "이벤트", color: c.orange, content: "배달의민족, 네이버페이, CGV 기프티콘이 새로 추가되었습니다. 오픈 베타 기념 10% 할인 교환 이벤트도 진행 중입니다!" },
          ].map((notice, i) => (
            <Card key={i} style={{ marginBottom: 10, padding: 16, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge color={notice.color} glow={`${notice.color}22`}>{notice.badge}</Badge>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{notice.title}</span>
                </div>
                <span style={{ fontSize: 11, color: c.textMuted }}>{notice.date}</span>
              </div>
              <p style={{ fontSize: 12, color: c.textDim, margin: 0, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {notice.content}
              </p>
            </Card>
          ))}
        </div>
      )}

      {tab === "내 문의" && (
        <div>
          {[
            { id: "CS-0042", date: "02.26", title: "리워드 미지급 문의", status: "답변 완료", statusColor: c.green, messages: 3 },
            { id: "CS-0038", date: "02.22", title: "앱 등록 오류 발생", status: "처리 중", statusColor: c.orange, messages: 2 },
            { id: "CS-0031", date: "02.18", title: "테스터 이탈 관련 문의", status: "답변 완료", statusColor: c.green, messages: 4 },
          ].map((ticket, i) => (
            <Card key={i} style={{ marginBottom: 10, padding: 16, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: c.textMuted, fontFamily: "monospace" }}>{ticket.id}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{ticket.title}</span>
                </div>
                <Badge color={ticket.statusColor} glow={`${ticket.statusColor}22`}>{ticket.status}</Badge>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: c.textDim }}>{ticket.date}</span>
                <span style={{ fontSize: 12, color: c.textDim }}>💬 {ticket.messages}개 메시지</span>
              </div>
            </Card>
          ))}

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p style={{ fontSize: 13, color: c.textDim, marginBottom: 10 }}>찾는 답변이 없으신가요?</p>
            <Button primary small onClick={() => setTab("문의하기")}>새 문의 작성</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============ ADMIN ============

const AdminDashboard = ({ setScreen }) => {
  const [tab, setTab] = useState("대시보드");
  const [userTab, setUserTab] = useState("전체");
  const [appTab, setAppTab] = useState("승인 대기");
  const [settleTab, setSettleTab] = useState("출금 요청");

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${c.red}, ${c.orange})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚙️</div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: c.text, margin: 0 }}>관리자</h2>
          <span style={{ fontSize: 12, color: c.textDim }}>TestBridge Admin</span>
        </div>
      </div>

      <TabBar tabs={["대시보드", "사용자", "앱 관리", "정산", "CS관리"]} active={tab} onSelect={setTab} />

      {tab === "대시보드" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "총 사용자", value: "1,247", sub: "+38 이번 주", color: c.accent, icon: "👥" },
              { label: "DAU / MAU", value: "312 / 894", sub: "활성율 34.9%", color: c.green, icon: "📊" },
              { label: "진행 중 테스트", value: "67", sub: "+12 이번 주", color: c.orange, icon: "🔬" },
              { label: "이번 달 매출", value: "4.8M", sub: "+23% MoM", color: c.purple, icon: "💰" },
            ].map((s) => (
              <Card key={s.label} style={{ flex: "1 1 calc(50% - 5px)", minWidth: 140, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <Badge color={s.color} glow={`${s.color}22`}>{s.sub}</Badge>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>수익 현황</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {[
                { label: "구독료", value: "2,890,000원", color: c.accent },
                { label: "수수료", value: "1,245,000원", color: c.green },
                { label: "건별 결제", value: "680,000원", color: c.orange },
              ].map((r) => (
                <div key={r.label} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: r.color }}>{r.value}</div>
                  <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{r.label}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 80, borderRadius: 8, background: c.bg, display: "flex", alignItems: "flex-end", padding: "10px 6px", gap: 4 }}>
              {[35, 42, 38, 55, 48, 62, 58, 71, 65, 78, 72, 85].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(180deg, ${c.accent}, ${c.accent}44)`, borderRadius: 3 }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: c.textMuted, marginTop: 4 }}>
              <span>1월</span><span>6월</span><span>12월</span>
            </div>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>긴급 알림</div>
            {[
              { type: "신고", msg: "tester_xxx 허위 리뷰 신고 접수 (3건)", color: c.red, time: "10분 전" },
              { type: "이탈", msg: "FitTracker 테스트 이탈률 25% 초과", color: c.orange, time: "1시간 전" },
              { type: "출금", msg: "대량 출금 요청 감지 (500,000원)", color: c.orange, time: "2시간 전" },
              { type: "앱", msg: "신규 앱 승인 대기 5건", color: c.accent, time: "3시간 전" },
            ].map((alert, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: i < 3 ? `1px solid ${c.border}` : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: alert.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Badge color={alert.color} glow={`${alert.color}22`}>{alert.type}</Badge>
                    <span style={{ fontSize: 13, color: c.text }}>{alert.msg}</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: c.textMuted, flexShrink: 0 }}>{alert.time}</span>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 14 }}>플랜별 사용자 분포</div>
            {[
              { plan: "Free", count: 782, pct: 63, color: c.textDim },
              { plan: "Basic", count: 298, pct: 24, color: c.accent },
              { plan: "Pro", count: 134, pct: 11, color: c.green },
              { plan: "Enterprise", count: 33, pct: 2, color: c.purple },
            ].map((p) => (
              <div key={p.plan} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{p.plan}</span>
                  <span style={{ fontSize: 12, color: c.textDim }}>{p.count}명 ({p.pct}%)</span>
                </div>
                <ProgressBar value={p.pct} max={100} color={p.color} />
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === "사용자" && (
        <div>
          <div style={{ height: 40, borderRadius: 10, border: `1px solid ${c.border}`, background: c.card, display: "flex", alignItems: "center", padding: "0 14px", marginBottom: 14, color: c.textMuted, fontSize: 13 }}>
            🔍  이름, 이메일, 닉네임으로 검색...
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["전체", "개발자", "테스터", "정지됨"].map((t) => (
              <div
                key={t}
                onClick={() => setUserTab(t)}
                style={{ padding: "5px 12px", borderRadius: 16, background: userTab === t ? c.accent : c.card, border: `1px solid ${userTab === t ? c.accent : c.border}`, color: userTab === t ? "#fff" : c.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                {t}
              </div>
            ))}
          </div>

          {[
            { name: "dev_hong", email: "hong@gmail.com", role: "개발자", plan: "Basic", apps: 5, joined: "01.15", status: "정상" },
            { name: "tester_kim", email: "kim@gmail.com", role: "테스터", plan: "Free", tests: 12, joined: "01.20", status: "정상", score: 92 },
            { name: "dev_park", email: "park@gmail.com", role: "둘 다", plan: "Pro", apps: 8, tests: 3, joined: "02.01", status: "정상" },
            { name: "tester_xxx", email: "xxx@gmail.com", role: "테스터", plan: "Free", tests: 2, joined: "02.20", status: "신고접수", score: 35 },
            { name: "dev_lee", email: "lee@gmail.com", role: "개발자", plan: "Free", apps: 1, joined: "02.25", status: "정상" },
          ].map((user, i) => (
            <Card key={i} style={{ marginBottom: 10, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: user.status === "신고접수" ? c.redGlow : c.accentGlow, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {user.status === "신고접수" ? "⚠️" : "👤"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>@{user.name}</span>
                      <Badge color={user.role === "개발자" ? c.accent : user.role === "테스터" ? c.green : c.purple} glow={user.role === "개발자" ? c.accentGlow : user.role === "테스터" ? c.greenGlow : `${c.purple}22`}>{user.role}</Badge>
                      {user.status === "신고접수" && <Badge color={c.red} glow={c.redGlow}>신고</Badge>}
                    </div>
                    <div style={{ fontSize: 12, color: c.textDim, marginTop: 2 }}>{user.email}</div>
                    <div style={{ fontSize: 11, color: c.textMuted, marginTop: 4 }}>
                      {user.plan} · 가입 {user.joined}
                      {user.apps !== undefined && ` · 앱 ${user.apps}개`}
                      {user.tests !== undefined && ` · 테스트 ${user.tests}회`}
                      {user.score !== undefined && ` · 신뢰도 ${user.score}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button small>상세</Button>
                  <Button small style={{ color: c.orange, borderColor: c.orange + "44" }}>경고</Button>
                  <Button small style={{ color: c.red, borderColor: c.red + "44" }}>정지</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "앱 관리" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["승인 대기", "운영 중", "신고됨", "차단됨"].map((t) => (
              <div
                key={t}
                onClick={() => setAppTab(t)}
                style={{ padding: "5px 12px", borderRadius: 16, background: appTab === t ? c.accent : c.card, border: `1px solid ${appTab === t ? c.accent : c.border}`, color: appTab === t ? "#fff" : c.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                {t}
              </div>
            ))}
          </div>

          {appTab === "승인 대기" && [
            { name: "QuickMemo", emoji: "📝", dev: "dev_choi", cat: "생산성", submitted: "02.27 09:30", reward: "3,000원" },
            { name: "DailyFit", emoji: "💪", dev: "dev_jung", cat: "건강", submitted: "02.27 08:15", reward: "상호 테스트" },
            { name: "PicEdit", emoji: "🎨", dev: "dev_yoon", cat: "사진", submitted: "02.26 22:40", reward: "2,000원" },
            { name: "CashBook", emoji: "💵", dev: "dev_song", cat: "금융", submitted: "02.26 18:20", reward: "4,000원" },
            { name: "GameHub", emoji: "🎮", dev: "dev_han", cat: "게임", submitted: "02.26 15:50", reward: "5,000원" },
          ].map((app, i) => (
            <Card key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <AppIcon emoji={app.emoji} size={48} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>{app.name}</span>
                    <Badge>{app.cat}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: c.textDim }}>@{app.dev} · {app.submitted} · 리워드 {app.reward}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Button small primary style={{ flex: 1 }}>승인</Button>
                <Button small style={{ flex: 1 }}>상세 검토</Button>
                <Button small style={{ flex: 1, color: c.red, borderColor: c.red + "44" }}>반려</Button>
              </div>
            </Card>
          ))}

          {appTab === "신고됨" && (
            <div>
              <Card style={{ marginBottom: 10, borderColor: c.red + "44" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <AppIcon emoji="🎰" size={48} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>LuckySlot</span>
                      <Badge color={c.red} glow={c.redGlow}>신고 3건</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: c.textDim }}>@dev_xxx · 도박성 앱 의심 · 신고자 3명</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Button small style={{ flex: 1 }}>상세 확인</Button>
                  <Button small style={{ flex: 1, color: c.orange, borderColor: c.orange + "44" }}>경고</Button>
                  <Button small style={{ flex: 1, color: c.red, borderColor: c.red + "44" }}>차단</Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === "정산" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[
              { label: "미지급 리워드", value: "1,250,000원", color: c.orange },
              { label: "출금 대기", value: "380,000원", color: c.red },
              { label: "이번 달 지급", value: "3,450,000원", color: c.green },
            ].map((s) => (
              <Card key={s.label} style={{ flex: 1, textAlign: "center", padding: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["출금 요청", "리워드 대기", "정산 완료"].map((t) => (
              <div
                key={t}
                onClick={() => setSettleTab(t)}
                style={{ padding: "5px 12px", borderRadius: 16, background: settleTab === t ? c.accent : c.card, border: `1px solid ${settleTab === t ? c.accent : c.border}`, color: settleTab === t ? "#fff" : c.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                {t}
              </div>
            ))}
          </div>

          {settleTab === "출금 요청" && [
            { user: "tester_kim", amount: "50,000원", bank: "국민 ****1234", date: "02.27 10:30", flag: false },
            { user: "tester_park", amount: "25,000원", bank: "신한 ****5678", date: "02.27 09:15", flag: false },
            { user: "tester_xxx", amount: "500,000원", bank: "토스 ****9012", date: "02.27 08:40", flag: true },
          ].map((w, i) => (
            <Card key={i} style={{ marginBottom: 10, borderColor: w.flag ? c.red + "44" : c.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>@{w.user}</span>
                  {w.flag && <Badge color={c.red} glow={c.redGlow}>이상 감지</Badge>}
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color: w.flag ? c.red : c.green }}>{w.amount}</span>
              </div>
              <div style={{ fontSize: 12, color: c.textDim, marginBottom: 10 }}>{w.bank} · {w.date}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button small primary style={{ flex: 1 }}>승인</Button>
                <Button small style={{ flex: 1 }}>보류</Button>
                <Button small style={{ flex: 1, color: c.red, borderColor: c.red + "44" }}>거절</Button>
              </div>
            </Card>
          ))}

          {settleTab === "리워드 대기" && [
            { app: "FitTracker", dev: "dev_hong", testers: 18, total: "54,000원", due: "03.02" },
            { app: "StudyMate", dev: "dev_park", testers: 22, total: "44,000원", due: "03.08" },
          ].map((r, i) => (
            <Card key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{r.app}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: c.orange }}>{r.total}</span>
              </div>
              <div style={{ fontSize: 12, color: c.textDim }}>@{r.dev} · 테스터 {r.testers}명 · 예정일 {r.due}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Button small primary style={{ flex: 1 }}>즉시 지급</Button>
                <Button small style={{ flex: 1 }}>상세</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "CS관리" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[
              { label: "미답변", value: "8", color: c.red },
              { label: "처리 중", value: "5", color: c.orange },
              { label: "오늘 완료", value: "12", color: c.green },
            ].map((s) => (
              <Card key={s.label} style={{ flex: 1, textAlign: "center", padding: 14 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: c.textDim, marginBottom: 10 }}>미답변 문의</div>
          {[
            { id: "CS-0048", user: "dev_choi", title: "프로덕션 등록 실패 후 리워드 환불 요청", type: "결제/환불", time: "30분 전", priority: "긴급" },
            { id: "CS-0047", user: "tester_yoon", title: "기프티콘 교환 후 미수신", type: "리워드/출금", time: "1시간 전", priority: "높음" },
            { id: "CS-0046", user: "dev_jung", title: "앱 등록 시 스크린샷 업로드 오류", type: "버그 신고", time: "2시간 전", priority: "보통" },
            { id: "CS-0045", user: "tester_lee", title: "테스터 이탈 페널티 이의제기", type: "테스트 관련", time: "3시간 전", priority: "높음" },
          ].map((ticket, i) => (
            <Card key={i} style={{ marginBottom: 10, borderColor: ticket.priority === "긴급" ? c.red + "44" : c.border }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: c.textMuted, fontFamily: "monospace" }}>{ticket.id}</span>
                  <Badge color={ticket.priority === "긴급" ? c.red : ticket.priority === "높음" ? c.orange : c.textDim} glow={ticket.priority === "긴급" ? c.redGlow : ticket.priority === "높음" ? c.orangeGlow : `${c.textDim}22`}>
                    {ticket.priority}
                  </Badge>
                  <Badge>{ticket.type}</Badge>
                </div>
                <span style={{ fontSize: 11, color: c.textMuted }}>{ticket.time}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 4 }}>{ticket.title}</div>
              <div style={{ fontSize: 12, color: c.textDim, marginBottom: 10 }}>@{ticket.user}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button small primary style={{ flex: 1 }}>답변하기</Button>
                <Button small style={{ flex: 1 }}>담당자 배정</Button>
              </div>
            </Card>
          ))}

          <Card style={{ marginTop: 16, background: c.bg }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 12 }}>신고 접수 현황</div>
            {[
              { reporter: "tester_kim", target: "tester_xxx", reason: "허위 리뷰 / 테스트 미참여", count: 3, date: "02.27" },
              { reporter: "dev_hong", target: "tester_ghost", reason: "옵트인 후 즉시 앱 삭제 반복", count: 2, date: "02.26" },
            ].map((report, i) => (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < 1 ? `1px solid ${c.border}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>@{report.target}</span>
                  <Badge color={c.red} glow={c.redGlow}>신고 {report.count}건</Badge>
                </div>
                <div style={{ fontSize: 12, color: c.textDim }}>{report.reason} · 신고자 @{report.reporter} · {report.date}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Button small style={{ color: c.orange, borderColor: c.orange + "44" }}>경고</Button>
                  <Button small style={{ color: c.red, borderColor: c.red + "44" }}>정지</Button>
                  <Button small>무혐의</Button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
};

// ============ MAIN APP ============

export default function TestBridgeWireframe() {
  const [screen, setScreen] = useState(screens.landing);
  const [role, setRole] = useState("dev");

  const renderScreen = () => {
    switch (screen) {
      case screens.landing: return <LandingScreen setScreen={setScreen} setRole={setRole} />;
      case screens.signup: return <SignupScreen setScreen={setScreen} setRole={setRole} />;
      case screens.mypage: return <MyPageScreen setScreen={setScreen} role={role} setRole={setRole} />;
      case screens.devDashboard: return <DevDashboard setScreen={setScreen} />;
      case screens.appRegister: return <AppRegister setScreen={setScreen} />;
      case screens.appDetail: return <AppDetail setScreen={setScreen} />;
      case screens.testerHome: return <TesterHome setScreen={setScreen} />;
      case screens.testerAppDetail: return <TesterAppDetail setScreen={setScreen} />;
      case screens.testerMyTests: return <TesterMyTests setScreen={setScreen} />;
      case screens.feedback: return <FeedbackScreen setScreen={setScreen} />;
      case screens.reward: return <RewardScreen setScreen={setScreen} />;
      case screens.cs: return <CSScreen setScreen={setScreen} role={role} />;
      case screens.adminDashboard: return <AdminDashboard setScreen={setScreen} />;
      default: return <LandingScreen setScreen={setScreen} setRole={setRole} />;
    }
  };

  const showNav = screen !== screens.landing && screen !== screens.signup;

  const testerNav = (
    <div style={{ display: "flex", borderTop: `1px solid ${c.border}`, background: c.card, position: "sticky", bottom: 0 }}>
      {[
        { icon: "🔍", label: "탐색", s: screens.testerHome },
        { icon: "📋", label: "내 테스트", s: screens.testerMyTests },
        { icon: "💰", label: "리워드", s: screens.reward },
        { icon: "👤", label: "프로필", s: screens.mypage },
      ].map((nav) => (
        <button
          key={nav.label}
          onClick={() => nav.s && setScreen(nav.s)}
          style={{
            flex: 1,
            padding: "10px 0",
            background: "none",
            border: "none",
            color: screen === nav.s ? c.green : c.textDim,
            fontSize: 10,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 18 }}>{nav.icon}</span>
          {nav.label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ fontFamily: "'Pretendard', -apple-system, sans-serif", background: c.bg, color: c.text, minHeight: "100vh", maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column", position: "relative", border: `1px solid ${c.border}`, borderRadius: 20, overflow: "hidden" }}>
      {showNav && <Nav role={role} setRole={setRole} screen={screen} setScreen={setScreen} />}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {renderScreen()}
      </div>
      {showNav && role === "tester" && testerNav}
    </div>
  );
}
