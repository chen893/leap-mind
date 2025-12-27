export async function register() {
  // 只在服务端运行时配置代理
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const proxyUrl =
      process.env.HTTPS_PROXY ??
      process.env.HTTP_PROXY ??
      process.env.ALL_PROXY;

    if (proxyUrl) {
      console.log(`[Proxy] 正在配置代理: ${proxyUrl}`);

      try {
        const { ProxyAgent, setGlobalDispatcher } = await import("undici");
        const agent = new ProxyAgent(proxyUrl);
        setGlobalDispatcher(agent);
        console.log("[Proxy] 全局代理已配置成功");
      } catch (error) {
        console.error("[Proxy] 代理配置失败:", error);
      }
    }
  }
}
