import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>QRスキャン通知（MVP）</h1>
          <p>
            QRコードからアクセスされる入口は <code>/s/&lt;publicTagId&gt;</code>{" "}
            です。ここでは個人情報は一切扱いません。
          </p>
        </div>
      </main>
    </div>
  );
}
