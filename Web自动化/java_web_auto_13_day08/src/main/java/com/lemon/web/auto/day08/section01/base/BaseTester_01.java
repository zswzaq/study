package com.lemon.web.auto.day08.section01.base;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;

import com.lemon.web.auto.day08.section01.pojo.Locator;
import com.lemon.web.auto.day08.section01.util.PropertiesFileUtils;
import com.lemon.web.auto.day08.section01.util.WebAutoUtils;

/**
 * 基础测试类
 * 
 * @author happy
 *
 */
public class BaseTester_01 {
	protected static WebDriver driver = null;

	@BeforeSuite
	public void beforeSuite() {
		driver = WebAutoUtils.getDriver("Chrome", "2.x");
	}

	@AfterSuite
	public void afterSuite() throws InterruptedException {
		Thread.sleep(5000);
		driver.quit();
	}

	public String getCurrentPageUrl() {
		return driver.getCurrentUrl();
	}

	/**
	 * 直到当前页面url包含了partailUrl才返回true
	 * 
	 * @param partailUrl
	 * @return
	 */
	public Boolean currentPageUrlContains(String partailUrl) {
		// 智能等待
		WebDriverWait wait = new WebDriverWait(driver, 5);
		return wait.until(ExpectedConditions.urlContains(partailUrl));

		/*
		 * return wait.until(new ExpectedCondition<Boolean>() {
		 * 
		 * @Override public Boolean apply(WebDriver input) { String
		 * currentPageUrl = driver.getCurrentUrl();
		 * //如果当前页面url不为空，而且包含部分的url，返回true if (currentPageUrl !=null &&
		 * currentPageUrl.contains(partailUrl)) { return true; } return false; }
		 * });
		 */
	}

	/**
	 * 默认智能等待5s的找元素的方法
	 * 
	 * @param by
	 * @return
	 */
	protected WebElement getElement(By by) {
		return getElement(by, 5L);
	}

	/**
	 * 
	 * @param by
	 * @param timeOutInSeconds
	 * @return
	 */
	protected WebElement getElement(By by, Long timeOutInSeconds) {
		WebDriverWait wait = new WebDriverWait(driver, timeOutInSeconds);
		// 匿名内部类型
		WebElement element = wait.until(new ExpectedCondition<WebElement>() {
			@Override
			public WebElement apply(WebDriver input) {
				return driver.findElement(by);// dom结构中存在
			}
		});
		return element;
	}

	/**
	 * 智能等待去获取元素的文本：只有当元素文本长度大于0时才返回
	 * 
	 * toast：当toast：当页面某个元素的文本出现：登录失败！！
	 * 
	 * @param by
	 * @return
	 */
	// 期望条件是，等待的元素的文本不为空（元素的文本的长度大于0）
	public String getElementTextNotNull(By by) {
		WebDriverWait wait = new WebDriverWait(driver, 5L);
		String elementText = wait.until(new ExpectedCondition<String>() {
			@Override
			public String apply(WebDriver input) {
				System.out.println("------------------------");
				// 先获取这个元素
				WebElement element = driver.findElement(by);
				// 如果元素不为空，并且元素的文本不为空，然后元素文本长度大于0
				// 真正能返回非空是当下面的条件满足的时候
				if (element != null && element.getText() != null && element.getText().length() > 0) {
					return element.getText();
				}
				return null;
			}
		});

		return elementText;
	}

	protected WebElement getElementToBeClickable(By by) {
		WebDriverWait wait = new WebDriverWait(driver, 10);
		return wait.until(ExpectedConditions.elementToBeClickable(by));
	}

	/**
	 * 打开某个页面
	 * 
	 * @param urlKey
	 *            url对应的属性名称
	 */
	protected void to(String urlKey) {
		String url = PropertiesFileUtils.getUrl(urlKey);
		driver.get(url);
	}

	/**
	 * 点击元素
	 * 
	 * @param by
	 *            元素定位器（Locator）
	 */
	protected void click(By by) {
		// 显示等待
		getElement(by).click();
	}

	protected void click(Locator locator) {
		String type = locator.getType();// 定位的方式：id,name,cssSelector，xpath...
		String value = locator.getValue();// 定位的值:phone password
		// 通过type和value得到一个by对象
		By by = null;
		if ("id".equalsIgnoreCase(type)) {
			by = By.id(value);
		} else if ("name".equalsIgnoreCase(type)) {
			by = By.name(value);
		} else if ("tagName".equalsIgnoreCase(type)) {
			by = By.tagName(value);
		} else if ("linkText".equalsIgnoreCase(type)) {
			by = By.linkText(value);
		} else if ("partialLinkText".equalsIgnoreCase(type)) {
			by = By.partialLinkText(value);
		} else if ("cssSelector".equalsIgnoreCase(type)) {
			by = By.cssSelector(value);
		} else if ("className".equalsIgnoreCase(type)) {
			by = By.className(value);
		} else if ("xpath".equalsIgnoreCase(type)) {
			by = By.xpath(value);
		} else {
			throw new RuntimeException("没有这种定位方式！！！");
		}
		// 显示等待
		getElement(by).click();
	}

	/**
	 * 输入内容
	 * 
	 * @param by
	 *            元素定位器
	 * @param content
	 *            要输入的内容
	 */
	protected void type(By by, String content) {
		// 显示等待
		getElement(by).sendKeys(content);
	}

	protected void type(Locator locator, String content) {
		String type = locator.getType();// 定位的方式：id,name,cssSelector，xpath...
		String value = locator.getValue();// 定位的值:phone password
		// 通过type和value得到一个by对象
		By by = null;
		if ("id".equalsIgnoreCase(type)) {
			by = By.id(value);
		} else if ("name".equalsIgnoreCase(type)) {
			by = By.name(value);
		} else if ("tagName".equalsIgnoreCase(type)) {
			by = By.tagName(value);
		} else if ("linkText".equalsIgnoreCase(type)) {
			by = By.linkText(value);
		} else if ("partialLinkText".equalsIgnoreCase(type)) {
			by = By.partialLinkText(value);
		} else if ("cssSelector".equalsIgnoreCase(type)) {
			by = By.cssSelector(value);
		} else if ("className".equalsIgnoreCase(type)) {
			by = By.className(value);
		} else if ("xpath".equalsIgnoreCase(type)) {
			by = By.xpath(value);
		} else {
			throw new RuntimeException("没有这种定位方式！！！");
		}
		getElement(by).sendKeys(content);
	}

	/**
	 * 获取元素的文本
	 * 
	 * @param by
	 *            元素的定位器
	 * @return
	 */
	protected String getText(By by) {
		// 显示等待
		return getElement(by).getText();
	}

}
