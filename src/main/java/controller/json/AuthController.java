package controller.json;

import java.util.HashMap;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.support.SessionStatus;

import dao.MemberDao;
import vo.JsonResult;
import vo.Member;

@Controller 
@RequestMapping("/auth/") 
public class AuthController {
  
  @Autowired MemberDao memberDao;
  
  @RequestMapping(path="login")
  public Object login(
      HttpSession session, /* 세션이 무효화된 이후에 세션을 자동 생성하도록 강제한다.*/
      HttpServletResponse response,
      String email,
      String password,
      boolean saveEmail, 
      SessionStatus sessionStatus) throws Exception {
    
    try {
      
      Cookie cookie = new Cookie("email", email);
      if (!saveEmail){
        cookie.setMaxAge(0); 
        cookie.setPath("/");
      } else {
        cookie.setMaxAge(60 * 60 * 24 * 7);
        cookie.setPath("/");
      }
      response.addCookie(cookie);
      
      HashMap<String,Object> map = new HashMap<>();
      map.put("email", email);
      map.put("password", password);
      
      Member member = memberDao.selectOneByEmailAndPassword(map);
      
      if (member == null) {
        sessionStatus.setComplete(); // 스프링이 관리하는 세션 값을 무효화시킨다.
        return JsonResult.fail();
        
      } else {
        session.setAttribute("member", member);
        return JsonResult.success(member);
      }
      
    } catch (Exception e) {
      e.printStackTrace();
      return JsonResult.error(e.getMessage());
      
    }
  }
  
  @RequestMapping(path="logout")
  public Object logout(HttpSession session, SessionStatus sessionStatus) throws Exception {
    try {
      sessionStatus.setComplete();
      session.invalidate();
      return JsonResult.success();
    } catch (Exception e) {
      return JsonResult.error(e.getMessage());
    }
  }
  
  
  @RequestMapping(path="loginuser")
  public Object loginUser(HttpSession session) throws Exception {
    
    try {
      Member member = (Member)session.getAttribute("member");
      if (member == null) {
        return JsonResult.fail();
        //throw new Exception("로그인이 되지 않았습니다.");
      }
      return JsonResult.success(member);
    } catch (Exception e) {
      e.printStackTrace();
      return JsonResult.error(e.getMessage());
    }
  }
  
  @RequestMapping(path="confirmemail")
  public Object confirmEmail(HttpSession session, String email) throws Exception {
    
    try {
      
      HashMap<String, Object> map = new HashMap<>();
      map.put("email", email);
      Member member = memberDao.confirmEmail(map);
      
      if (member == null) {
        session.setAttribute("confirmemail", email);
        return JsonResult.success();
      }
        return JsonResult.fail();
      
    } catch (Exception e) {
      e.printStackTrace();
      return JsonResult.error(e.getMessage());
    }
  }
  
  @RequestMapping(path="confirmnickname")
  public Object confirmNickname(HttpSession session, String nickname) throws Exception {
    
    try {
      
      HashMap<String, Object> map = new HashMap<>();
      map.put("nickname", nickname);
      Member member = memberDao.confirmNickname(map);
      
      if (member == null) {
        session.setAttribute("confirmnickname", nickname);
        return JsonResult.success();
      }
        return JsonResult.fail();
      
    } catch (Exception e) {
      e.printStackTrace();
      return JsonResult.error(e.getMessage());
    }
  }
  
  @RequestMapping(path="signup")
  public Object signUp(HttpSession session,String email, String password, String nickname, SessionStatus sessionStatus) throws Exception {
    try {
      
      HashMap<String, Object> map = new HashMap<>();
      map.put("email", email);
      map.put("password", password);
      map.put("nickname", nickname);
      
      memberDao.insertMember(map);
      
      sessionStatus.setComplete();
      session.invalidate();
      return JsonResult.success();
    } catch(Exception e) {
      e.printStackTrace();
      return JsonResult.error(e.getMessage());
    }
    
  }
  
  @RequestMapping(path="update")
  public Object updateMember(Member member) throws Exception {
    try {
      
      System.out.println(member.getNo());
      System.out.println(member.getEmail());
      System.out.println(member.getNickname());
      System.out.println(member.getPassword());
      System.out.println(member.isGender());
      System.out.println(member.getHeight());
      System.out.println(member.getWeight());
      System.out.println(member.getPosition());
      System.out.println(member.getSkill());
      
      
      
      if (memberDao.selectOne(member.getNo()) == null) {
        //throw new Exception("해당 게시물이 없습니다!");
        return JsonResult.fail();
      }
      
      
      memberDao.update(member);
      return JsonResult.success();
      
    } catch (Exception e) {
      return JsonResult.error(e.getMessage());
    }
  }
  
  
 
  
  
  
  
  
}










