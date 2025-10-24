"use client";

export default function LoginPage() {
  return (
    <div className="bg-beige border min-h-screen">
      <h1>Login</h1>
      <form>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
